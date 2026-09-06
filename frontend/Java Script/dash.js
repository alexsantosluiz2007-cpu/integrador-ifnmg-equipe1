// Relógio
function atualizarRelogio() {
    const agora = new Date();

    document.getElementById("relogio").innerHTML =
        agora.toLocaleTimeString();
    document.getElementById("ultimaAtualizacao").innerHTML =
        agora.toLocaleTimeString();
}
setInterval(atualizarRelogio, 1000);


// Gráfico
const ctx = document.getElementById('grafico');
const grafico = new Chart(ctx, {

    type: 'line',

    data: {

        labels: [],

        datasets: [

            {
                label: 'Temperatura °C',
                data: [],
                borderColor: 'red'
            },

            {
                label: 'Umidade %',
                data: [],
                borderColor: 'blue'
            },

            {
                label: 'Luminosidade lux',
                data: [],
                borderColor: 'gold'
            }

        ]
    }
});
// Adiciona dados
function adicionarLeitura(temp, umi, lux) {

    const hora = new Date().toLocaleTimeString();

    document.getElementById("temperatura").innerText = temp;
    document.getElementById("umidade").innerText = umi;
    document.getElementById("luminosidade").innerText = lux;

    grafico.data.labels.push(hora);

    grafico.data.datasets[0].data.push(temp);
    grafico.data.datasets[1].data.push(umi);
    grafico.data.datasets[2].data.push(lux);

    if (grafico.data.labels.length > 15) {

        grafico.data.labels.shift();

        grafico.data.datasets[0].data.shift();
        grafico.data.datasets[1].data.shift();
        grafico.data.datasets[2].data.shift();
    }

    grafico.update();

    const tabela = document.getElementById("tabelaDados");

    tabela.innerHTML =
        `
        <tr>
            <td>${hora}</td>
            <td>${temp}</td>
            <td>${umi}</td>
            <td>${lux}</td>
        </tr>
    `
        + tabela.innerHTML;
}


// BUSCA DADOS DA API
async function buscarDados() {
    try {
        const resposta = await fetch(
            "LINK DA API AQUI"
        );

        const dados = await resposta.json();
        document.getElementById("temperatura")
            .innerText = dados.temperatura;
        document.getElementById("umidade")
            .innerText = dados.umidade;
        document.getElementById("luminosidade")
            .innerText = dados.luminosidade;

        verificarStatus(dados.ultimaAtualizacao);

        //FUNÇÃO QUE VERIFICA SE O ARDUINO ESTÁ ONLINE OU OFFLINE
        function verificarStatus(dataUltimaLeitura) {
            const status =
                document.getElementById("statusArduino");
            const ultimaLeitura =
                document.getElementById("ultimaLeitura");
            const ultima =
                new Date(dataUltimaLeitura);
            const agora =
                new Date();
            const diferenca =
                (agora - ultima) / 1000;
            ultimaLeitura.textContent =
                ultima.toLocaleTimeString();
            if (diferenca <= 10) {
                status.textContent = "● Online";
                status.className = "status-online";
            }
            else {
                status.textContent = "● Offline";
                status.className = "status-offline";
            }
        }
    }

    catch (erro) {
        const status =
            document.getElementById("statusArduino");

        status.textContent = "● Offline";
        status.className = "status-offline";
    }
}


// BOTÃO
document
    .getElementById("btnAtualizar")
    .addEventListener("click", () => {

        alert("Atualização solicitada");

    });

    
const botoes = document.querySelectorAll(".botao-h");
const paginaAtual = window.location.pathname.split("/").pop();
botoes.forEach(botao => {

    const paginaBotao = botao.getAttribute("href");

    if (paginaBotao === paginaAtual) {
        botao.classList.add("ativo");
    }

});

