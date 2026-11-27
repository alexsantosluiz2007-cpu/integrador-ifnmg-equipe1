// =====================================================
// DASHBOARD
// Os dados vêm do módulo compartilhado JS/sensores.js
// (carregado antes deste arquivo no dashboard.html)
// =====================================================

// Relógio
function atualizarRelogio() {
    const relogio = document.getElementById("relogio");
    if (relogio) relogio.textContent = new Date().toLocaleTimeString();
}
atualizarRelogio();
setInterval(atualizarRelogio, 1000);


// Gráfico
const ctx = document.getElementById('grafico');
const grafico = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'Temperatura °C', data: [], borderColor: 'red' },
            { label: 'Umidade %', data: [], borderColor: 'blue' },
            { label: 'Luminosidade lux', data: [], borderColor: 'gold' }
        ]
    }
});


// Cards + gráfico
let ultimaPlotada = null;

function mostrarLeitura(l) {
    document.getElementById("temperatura").innerText = l.temperatura ?? "--";
    document.getElementById("umidade").innerText = l.umidade ?? "--";
    document.getElementById("luminosidade").innerText = l.luminosidade ?? "--";

    // Não repete ponto no gráfico se a leitura é a mesma de antes
    if (l.ultimaAtualizacao === ultimaPlotada) return;
    ultimaPlotada = l.ultimaAtualizacao;

    const hora = new Date(l.ultimaAtualizacao).toLocaleTimeString();
    grafico.data.labels.push(hora);
    grafico.data.datasets[0].data.push(l.temperatura);
    grafico.data.datasets[1].data.push(l.umidade);
    grafico.data.datasets[2].data.push(l.luminosidade);

    if (grafico.data.labels.length > 15) {
        grafico.data.labels.shift();
        grafico.data.datasets.forEach(d => d.data.shift());
    }
    grafico.update();
}


// Verifica se o Arduino está online ou offline
function verificarStatus(dataUltimaLeitura) {
    const status = document.getElementById("statusArduino");
    const ultimaLeitura = document.getElementById("ultimaLeitura");
    const ultima = new Date(dataUltimaLeitura);
    const diferenca = (new Date() - ultima) / 1000;

    ultimaLeitura.textContent = ultima.toLocaleTimeString();

    if (diferenca <= 10) {
        status.textContent = "● Online";
        status.className = "status-online";
    } else {
        status.textContent = "● Offline";
        status.className = "status-offline";
    }
}


// Recebe as leituras (a última leitura guardada aparece na hora, antes da API responder)
SensoresAPI.aoReceber(l => {
    mostrarLeitura(l);
    verificarStatus(l.ultimaAtualizacao);
});
SensoresAPI.iniciar();

// Reavalia o status a cada segundo (vira Offline se pararem de chegar leituras)
setInterval(() => {
    const ultima = SensoresAPI.ultima();
    if (ultima) verificarStatus(ultima.ultimaAtualizacao);
}, 1000);


// Destaca no menu a página atual
const botoes = document.querySelectorAll(".botao-h");
const paginaAtual = window.location.pathname.split("/").pop();
botoes.forEach(botao => {
    if (botao.getAttribute("href") === paginaAtual) {
        botao.classList.add("ativo");
    }
});
