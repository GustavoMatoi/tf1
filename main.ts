const dias = document.getElementById("contagem");
const dataDefesa = new Date('2026-02-01');
const dataHoje = new Date();

const diferencaMS: number = dataDefesa.getTime() - dataHoje.getTime();

const diferencaDias = Math.ceil(diferencaMS / (1000 * 60 * 60 * 24));

console.log("Oi")
console.log(`Faltam ${diferencaDias} dias para a defesa`);

if (dias) dias.textContent = diferencaDias.toString();
