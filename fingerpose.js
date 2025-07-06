// Captura o elemento de vídeo da página HTML
const video = document.getElementById("video");

// Captura o elemento canvas onde os pontos da mão serão desenhados
const canvas = document.getElementById("canvas");

// Obtém o contexto 2D do canvas, usado para desenhar na tela
const ctx = canvas.getContext("2d");

// Define as pontas dos dedos (índices dos pontos no modelo) e a cor para cada um
const fingertipPoints = {
  4: "red",        // Polegar
  8: "orange",     // Indicador
  12: "yellow",    // Médio
  16: "deepskyblue", // Anelar
  20: "violet",    // Mindinho
};

// Define os pares de dedos que devem ser comparados para medir distância
const proximityPairs = [
  [4, 8],   // Polegar e indicador
  [4, 12],  // Polegar e médio
  [4, 16],  // Polegar e anelar
  [4, 20],  // Polegar e mindinho
];

// Função que calcula a distância euclidiana entre dois pontos (p1 e p2)
function getDistance(p1, p2) {
  const dx = p1.x - p2.x; // Diferença no eixo X
  const dy = p1.y - p2.y; // Diferença no eixo Y
  return Math.sqrt(dx * dx + dy * dy); // Teorema de Pitágoras
}

// Função assíncrona que ativa a câmera do usuário
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 }, // Resolução da câmera
    audio: false // Sem áudio
  });
  video.srcObject = stream; // Define o vídeo como origem do stream
  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video); // Quando o vídeo estiver pronto, resolvemos a promise
  });
}

// Função principal do programa
async function main() {
  // Define o backend do TensorFlow.js como WebGL (para desempenho gráfico)
  await tf.setBackend("webgl");

  // Inicia a câmera
  await setupCamera();
  video.play(); // Inicia a reprodução do vídeo

  // Define o modelo de detecção de mãos da MediaPipe
  const model = handPoseDetection.SupportedModels.MediaPipeHands;

  // Cria o detector de mãos com configuração leve (lite)
  const detector = await handPoseDetection.createDetector(model, {
    runtime: "mediapipe", // Define o runtime
    modelType: "lite", // Usa o modelo leve (menos pesado)
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands" // URL do pacote do modelo
  });

  // Função que detecta mãos continuamente a cada frame
  async function detectHands() {
    const threshold = 10; // Distância máxima para considerar dois dedos "encostando"

    // Estima a posição das mãos no vídeo atual
    const hands = await detector.estimateHands(video);

    // Limpa o canvas antes de desenhar novos pontos
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Percorre todas as mãos detectadas
    for (let hand of hands) {
      const keypoints = hand.keypoints; // Pega os pontos-chave da mão

      // Desenha os círculos coloridos nos pontos das pontas dos dedos
      for (let index of Object.keys(fingertipPoints)) {
        const point = keypoints[index];
        if (point) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI); // Desenha um círculo no ponto
          ctx.fillStyle = fingertipPoints[index]; // Cor do dedo
          ctx.fill(); // Preenche o círculo
        }
      }

      // Variáveis para armazenar o estado dos gestos
      let pegarDetectado = false;
      let soltarDetectado = false;

      // Verifica cada par de pontos (polegar com os outros dedos)
      for (let [a, b] of proximityPairs) {
        const p1 = keypoints[a];
        const p2 = keypoints[b];
        if (p1 && p2) {
          const d = getDistance(p1, p2); // Calcula a distância entre os dois pontos
          if (d < threshold) pegarDetectado = true; // Se estiverem muito próximos, é um gesto de "pegar"
          if (d > threshold * 10) soltarDetectado = true; // Se estiverem muito longe, é um gesto de "soltar"
        }
      }

      // Determina qual gesto foi detectado com base nos pares
      if (pegarDetectado && !soltarDetectado) {
        console.log("🖐️ Gesto final: pegar");
      } else if (soltarDetectado && !pegarDetectado) {
        console.log("🙌 Gesto final: soltar");
      }
    }

    // Chama a detecção novamente no próximo frame (loop contínuo)
    requestAnimationFrame(detectHands);
  }

  // Inicia o processo de detecção
  detectHands();
}

// Chama a função principal para começar o programa
main();
