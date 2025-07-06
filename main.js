var dias = document.getElementById("contagem");
var dataDefesa = new Date('2026-02-01');
var dataHoje = new Date();
var diferencaMS = dataDefesa.getTime() - dataHoje.getTime();
var diferencaDias = Math.ceil(diferencaMS / (1000 * 60 * 60 * 24));
console.log("Oi");
console.log("Faltam ".concat(diferencaDias, " dias para a defesa"));
if (dias)
    dias.textContent = diferencaDias.toString();
