// ==========================================
// RELÓGIO
// ==========================================

function atualizarRelogio() {
    const agora = new Date();
    const hora = agora.toLocaleTimeString("pt-BR");

    const relogio = document.getElementById("relogio");
    const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");

    if (relogio) {
        relogio.textContent = hora;
    }

    if (ultimaAtualizacao) {
        ultimaAtualizacao.textContent = hora;
    }
}
atualizarRelogio();
setInterval(atualizarRelogio, 1000);


// ==========================================
// GRÁFICO DE HISTÓRICO
// ==========================================

const ctxHistorico = document
    .getElementById("graficoHistorico")
    .getContext("2d");

const grafico = new Chart(ctxHistorico, {
    type: "line",

    data: {
        labels: [],

        datasets: [
            {
                label: "Temperatura (°C)",
                data: [],
                borderColor: "#b83b3b",
                backgroundColor: "#b83b3b",
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.3
            },

            {
                label: "Umidade (%)",
                data: [],
                borderColor: "#386ca8",
                backgroundColor: "#386ca8",
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.3
            },

            {
                label: "Luminosidade (lux)",
                data: [],
                borderColor: "#d6aa24",
                backgroundColor: "#d6aa24",
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.3
            }
        ]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index",
            intersect: false
        },

        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    boxWidth: 35,
                    boxHeight: 8,
                    padding: 15,
                    font: {
                        size: 11
                    }
                }
            },
            tooltip: {
                enabled: true
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    font: {
                        size: 10
                    }
                },
                grid: {
                    color: "#eeeeee"
                }
            }
        }
    }
});


// ==========================================
// GRÁFICO CIRCULAR
// ==========================================
const ctxCircular = document
    .getElementById("graficoCircular")
    .getContext("2d");

const graficoCircular = new Chart(ctxCircular, {
    type: "doughnut",
    data: {
        labels: [
            "Temperatura",
            "Umidade",
            "Luminosidade"
        ],

        datasets: [
            {
                /*
                 * Usamos 1, 1, 1 apenas para o gráfico
                 * aparecer visualmente enquanto os valores
                 * reais ainda estão zerados.
                 */
                data: [1, 1, 1],

                backgroundColor: [
                    "#d63c3c",
                    "#376fbd",
                    "#f2c21c"
                ],

                borderColor: "#ffffff",
                borderWidth: 2
            }
        ]
    },

    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
            legend: {
                display: false
            },

            tooltip: {
                enabled: false
            }
        }
    }
});


// ==========================================
// ADICIONAR LEITURA
// ==========================================

function adicionarLeitura(temp, umi, lux) {

    const agora = new Date();

    const hora = agora.toLocaleTimeString("pt-BR");

    // ------------------------------------------
    // Atualiza os cards
    // ------------------------------------------

    const mediaTemperatura =
        document.getElementById("mediaTemperatura");

    const mediaUmidade =
        document.getElementById("mediaUmidade");

    const mediaLuminosidade =
        document.getElementById("mediaLuminosidade");

    if (mediaTemperatura) {
        mediaTemperatura.textContent = temp + " °C";
    }

    if (mediaUmidade) {
        mediaUmidade.textContent = umi + " %";
    }

    if (mediaLuminosidade) {
        mediaLuminosidade.textContent = lux + " lux";
    }


    // ------------------------------------------
    // Atualiza o gráfico
    // ------------------------------------------

    grafico.data.labels.push(hora);

    grafico.data.datasets[0].data.push(temp);
    grafico.data.datasets[1].data.push(umi);
    grafico.data.datasets[2].data.push(lux);


    // Mantém no máximo 15 registros
    if (grafico.data.labels.length > 15) {

        grafico.data.labels.shift();

        grafico.data.datasets[0].data.shift();
        grafico.data.datasets[1].data.shift();
        grafico.data.datasets[2].data.shift();
    }
    grafico.update();


    // ------------------------------------------
    // Atualiza a tabela
    // ------------------------------------------
    const tabela = document.getElementById("tabelaDados");
    if (tabela) {

        const novaLinha = `
            <tr>
                <td>${hora}</td>

                <td class="temperatura-texto">
                    ${temp}
                </td>

                <td class="umidade-texto">
                    ${umi}
                </td>

                <td class="luminosidade-texto">
                    ${lux}
                </td>

                <td>
                    <span class="status-normal">
                        Normal
                    </span>
                </td>
            </tr>
        `;
        tabela.insertAdjacentHTML(
            "afterbegin",
            novaLinha
        );
    }
}


// ==========================================
// ATUALIZAR ESTATÍSTICAS
// ==========================================

function atualizarEstatisticas(temp, umi, lux) {
    document.getElementById("mediaTemperatura").textContent =
        temp + " °C";

    document.getElementById("mediaUmidade").textContent =
        umi + " %";

    document.getElementById("mediaLuminosidade").textContent =
        lux + " lux";

    document.getElementById("maxTemperatura").textContent =
        temp;

    document.getElementById("minTemperatura").textContent =
        temp;

    document.getElementById("maxUmidade").textContent =
        umi;

    document.getElementById("minUmidade").textContent =
        umi;

    document.getElementById("maxLuminosidade").textContent =
        lux;

    document.getElementById("minLuminosidade").textContent =
        lux;
}


// ==========================================
// BUSCA DADOS DA API
// ==========================================
async function buscarDados() {

    try {

        const resposta = await fetch(
            "LINK DA API AQUI"
        );
        if (!resposta.ok) {
            throw new Error("Erro ao buscar dados da API");
        }
        const dados = await resposta.json();


        // ------------------------------------------
        // Valores recebidos
        // ------------------------------------------

        const temperatura = Number(dados.temperatura) || 0;
        const umidade = Number(dados.umidade) || 0;
        const luminosidade = Number(dados.luminosidade) || 0;

        // ------------------------------------------
        // Adiciona leitura
        // ------------------------------------------

        adicionarLeitura(
            temperatura,
            umidade,
            luminosidade
        );

        // ------------------------------------------
        // Atualiza estatísticas
        // ------------------------------------------
        atualizarEstatisticas(
            temperatura,
            umidade,
            luminosidade
        );
        // ------------------------------------------
        // Status do Arduino
        // ------------------------------------------
        verificarStatus(
            dados.ultimaAtualizacao
        );

    }

    catch (erro) {
        console.error(
            "Erro ao buscar dados:",
            erro
        );
        const status =
            document.getElementById("statusArduino");

        if (status) {
            status.textContent = "● Offline";
            status.className = "status-offline";
        }
    }
}


// ==========================================
// VERIFICAR STATUS DO ARDUINO
// ==========================================

function verificarStatus(dataUltimaLeitura) {
    const status =
        document.getElementById("statusArduino");
    if (!status || !dataUltimaLeitura) {
        return;
    }

    const ultima =
        new Date(dataUltimaLeitura);
    const agora =
        new Date();
    const diferenca =
        (agora - ultima) / 1000;


    if (diferenca <= 10) {

        status.textContent = "● Online";
        status.className = "status-online";

    } else {

        status.textContent = "● Offline";
        status.className = "status-offline";
    }
}


// ==========================================
// MENU
// ==========================================

const botoes =
    document.querySelectorAll(".botao-h");

const paginaAtual =
    window.location.pathname
        .split("/")
        .pop();
botoes.forEach(botao => {

    const paginaBotao =
        botao.getAttribute("href");

    if (paginaBotao === paginaAtual) {

        botao.classList.add("ativo");
    }

});


// ==========================================
// BOTÃO CONSULTAR
// ==========================================

const btnConsultar =
    document.getElementById("btnConsultar");
if (btnConsultar) {
    btnConsultar.addEventListener(
        "click",
        function () {

            console.log(
                "Consultando período selecionado..."
            );

            // Aqui futuramente podemos fazer
            // a consulta do histórico pela API.
        }
    );
}