// ================================
// CONFIGURAÇÃO DA API
// ================================

const URL_API_DASHBOARD = "http://localhost:3000/api/dashboard";


// ================================
// RELÓGIO
// ================================

function atualizarRelogio() {
    const agora = new Date();

    document.getElementById("relogio").innerHTML =
        agora.toLocaleTimeString();

    document.getElementById("ultimaAtualizacao").innerHTML =
        agora.toLocaleTimeString();
}

setInterval(atualizarRelogio, 1000);
atualizarRelogio();


// ================================
// GRÁFICO
// ================================

const ctx = document.getElementById("grafico");

const grafico = new Chart(ctx, {

    type: "line",

    data: {

        labels: [],

        datasets: [

            {
                label: "Temperatura °C",
                data: [],
                borderColor: "red"
            },

            {
                label: "Umidade %",
                data: [],
                borderColor: "blue"
            },

            {
                label: "Luminosidade Lux",
                data: [],
                borderColor: "gold"
            }

        ]
    }
});


// ================================
// ATUALIZA OS CARDS, O GRÁFICO E A TABELA
// ================================

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
        ` + tabela.innerHTML;
}


// ================================
// STATUS DO ARDUINO
// ================================

function atualizarStatusArduino(texto, classe) {
    const statusPrincipal = document.getElementById("statusArduino");
    const statusMenu = document.getElementById("statusArduinoMenu");

    if (statusPrincipal) {
        statusPrincipal.textContent = texto;
        statusPrincipal.className = classe;
    }

    if (statusMenu) {
        statusMenu.textContent = texto;
        statusMenu.className = classe;
    }
}

function verificarStatus(dataUltimaLeitura) {

    const ultimaLeitura = document.getElementById("ultimaLeitura");

    const ultima = new Date(dataUltimaLeitura);
    const agora = new Date();

    const diferenca = (agora - ultima) / 1000;

    ultimaLeitura.textContent = ultima.toLocaleTimeString();

    if (diferenca <= 10) {
        atualizarStatusArduino("● Online", "status-online");
    } else {
        atualizarStatusArduino("● Offline", "status-offline");
    }
}


// ================================
// BUSCA DADOS DA API
// ================================

async function buscarDados() {

    try {

        const resposta = await fetch(URL_API_DASHBOARD);

        if (!resposta.ok) {
            throw new Error("Erro ao consultar a API");
        }

        const resultado = await resposta.json();
        const dados = resultado.dados;

        if (!dados) {
            atualizarStatusArduino("● Offline", "status-offline");
            return;
        }

        adicionarLeitura(
            dados.temperatura,
            dados.umidade,
            dados.luminosidadeLux
        );

        verificarStatus(dados.dataHora);

    } catch (erro) {

        console.error("Erro ao buscar dados da API:", erro);

        atualizarStatusArduino("● Offline", "status-offline");
    }
}


// ================================
// BOTÃO DE ATUALIZAÇÃO
// ================================

document
    .getElementById("btnAtualizar")
    .addEventListener("click", buscarDados);


// ================================
// ATUALIZAÇÃO AUTOMÁTICA
// ================================

buscarDados();
setInterval(buscarDados, 3000);
