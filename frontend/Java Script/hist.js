// ==========================================
// CONFIGURAÇÕES
// ==========================================

// URL DA API
// ALTERE SOMENTE ESTA LINHA SE NECESSÁRIO
// Endpoint de resumos diários por usuário (endereço base em ../config.js)
const CAMINHO_API_HISTORICO = "/api/historico/diario";

// Quantidade de dias mostrados inicialmente na tabela
const LIMITE_INICIAL = 5;

// Tempo para consultar novamente a API (5 segundos)
const INTERVALO_API_MS = 5000;

let tabelaExpandida = false;


// ==========================================
// RELÓGIO EM TEMPO REAL
// ==========================================

function atualizarRelogio() {
    const relogioEl = document.querySelector(".relogio") || document.getElementById("relogio");
    if (relogioEl) {
        const agora = new Date();
        relogioEl.textContent = agora.toLocaleTimeString("pt-BR");
    }
}

atualizarRelogio();
setInterval(atualizarRelogio, 1000);


// ==========================================
// GRÁFICOS
// ==========================================

let graficoLinha = null;
let graficoRosca = null;


// ==========================================
// INICIALIZAR GRÁFICOS
// ==========================================

function inicializarGraficos() {
    // ------------------------------------------
    // GRÁFICO DE LINHA
    // ------------------------------------------
    const ctxLinha = document.getElementById("graficoHistorico") || document.querySelector("canvas");

    if (ctxLinha && !graficoLinha) {
        graficoLinha = new Chart(ctxLinha, {
            type: "line",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Temperatura (°C)",
                        data: [],
                        borderColor: "#b83b3b",
                        backgroundColor: "#b83b3b",
                        tension: 0.3,
                        fill: false
                    },
                    {
                        label: "Umidade (%)",
                        data: [],
                        borderColor: "#386ca8",
                        backgroundColor: "#386ca8",
                        tension: 0.3,
                        fill: false
                    },
                    {
                        label: "Luminosidade (lux)",
                        data: [],
                        borderColor: "#d6aa24",
                        backgroundColor: "#d6aa24",
                        tension: 0.3,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    // ------------------------------------------
    // GRÁFICO DE ROSCA
    // ------------------------------------------
    const ctxRosca = document.getElementById("graficoCircular");

    if (ctxRosca && !graficoRosca) {
        graficoRosca = new Chart(ctxRosca, {
            type: "doughnut",
            data: {
                labels: ["Temperatura Ideal", "Umidade Ideal", "Luminosidade Ideal"],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ["#b83b3b", "#386ca8", "#d6aa24"]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}


// ==========================================
// NORMALIZAR DADOS DA API
// ==========================================

async function buscarDadosAPI() {
    const hoje = new Date(Date.now() - 3 * 3600000).toISOString().slice(0,10);
    const dias = Number(document.getElementById("periodo")?.value || 7);
    const inicioCustom = document.getElementById("dataInicial")?.value;
    const fimCustom = document.getElementById("dataFinal")?.value;
    const inicio = inicioCustom && fimCustom ? inicioCustom : new Date(Date.parse(hoje) - dias * 86400000).toISOString().slice(0,10);
    const fim = inicioCustom && fimCustom ? fimCustom : new Date(Date.parse(hoje) - 86400000).toISOString().slice(0,10);
    const resposta = await apiFetch(CAMINHO_API_HISTORICO + "?" + new URLSearchParams({inicio, fim}), {method:"GET", cache:"no-cache"});
    if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);
    return (await resposta.json()).data;
}

// ==========================================
// DATA LOCAL - YYYY-MM-DD
// ==========================================

function calcularGeral(arr) {
    const validos = arr.filter(x => x.amostras > 0);
    const n = validos.reduce((a,x) => a+x.amostras,0);
    if (!n) return {min:"—",max:"—",media:"—",pct:null};
    return {min:Math.min(...validos.map(x=>x.min)), max:Math.max(...validos.map(x=>x.max)), media:(validos.reduce((a,x)=>a+x.soma,0)/n).toFixed(1), pct:Math.round(100*validos.reduce((a,x)=>a+x.ideais,0)/n)};
}
const mostrar = v => v == null ? "—" : Number(v.toFixed(1));

// ==========================================
// ATUALIZAR INTERFACE
// ==========================================

function atualizarInterface(resumoDiario) {
    if (!resumoDiario || resumoDiario.length === 0) {
        limparInterface("Nenhum dia completo encontrado.");
        return;
    }

    const todasTemps = resumoDiario.map(d => d.temp);
    const todasUmis = resumoDiario.map(d => d.umi);
    const todasLuxs = resumoDiario.map(d => d.lux);

    const statTemp = calcularGeral(todasTemps);
    const statUmi = calcularGeral(todasUmis);
    const statLux = calcularGeral(todasLuxs);

    atualizarTextoPorSeletor("#mediaTemperatura, .card-temp .valor, .card:nth-child(1) h2", `${statTemp.media} °C`);
    atualizarTextoPorSeletor("#minTemperatura, .card-temp .min", `${statTemp.min}`);
    atualizarTextoPorSeletor("#maxTemperatura, .card-temp .max", `${statTemp.max}`);

    atualizarTextoPorSeletor("#mediaUmidade, .card-umi .valor, .card:nth-child(2) h2", `${statUmi.media} %`);
    atualizarTextoPorSeletor("#minUmidade, .card-umi .min", `${statUmi.min}`);
    atualizarTextoPorSeletor("#maxUmidade, .card-umi .max", `${statUmi.max}`);

    atualizarTextoPorSeletor("#mediaLuminosidade, .card-lux .valor, .card:nth-child(3) h2", `${statLux.media} lux`);
    atualizarTextoPorSeletor("#minLuminosidade, .card-lux .min", `${statLux.min}`);
    atualizarTextoPorSeletor("#maxLuminosidade, .card-lux .max", `${statLux.max}`);

    const pctTemp = statTemp.pct, pctUmi = statUmi.pct, pctLux = statLux.pct;
    atualizarTextoPorSeletor("#percentTemperatura", pctTemp == null ? "—" : `${pctTemp}%`);
    atualizarTextoPorSeletor("#percentUmidade", pctUmi == null ? "—" : `${pctUmi}%`);
    atualizarTextoPorSeletor("#percentLuminosidade", pctLux == null ? "—" : `${pctLux}%`);

    renderizarTabela(resumoDiario);

    if (graficoLinha) {
        const dadosGrafico = [...resumoDiario].reverse();

        graficoLinha.data.labels = dadosGrafico.map(dia => {
            const partes = dia.data.split("-");
            return `${partes[2]}/${partes[1]}`;
        });

        graficoLinha.data.datasets[0].data = dadosGrafico.map(dia => dia.temp.media);
        graficoLinha.data.datasets[1].data = dadosGrafico.map(dia => dia.umi.media);
        graficoLinha.data.datasets[2].data = dadosGrafico.map(dia => dia.lux.media);

        graficoLinha.update();
    }

    if (graficoRosca) {
        graficoRosca.data.datasets[0].data = [pctTemp, pctUmi, pctLux];
        graficoRosca.update();
    }
}


// ==========================================
// RENDERIZAR TABELA
// ==========================================

function renderizarTabela(resumoDiario) {
    const tabela = document.getElementById("tabelaDados") || document.querySelector("tbody");
    const containerBotao = document.getElementById("containerVerMais");

    if (!tabela) return;

    tabela.innerHTML = "";

    const itensParaExibir = tabelaExpandida
        ? resumoDiario
        : resumoDiario.slice(0, LIMITE_INICIAL);

    itensParaExibir.forEach(dia => {
        const partes = dia.data.split("-");
        const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><strong>${dataFormatada}</strong></td>
            <td style="color: #b83b3b;">
                Média: <strong>${mostrar(dia.temp.media)}°C</strong><br>
                <small style="color: #777;">Máx: ${mostrar(dia.temp.max)}°C | Mín: ${mostrar(dia.temp.min)}°C</small>
            </td>
            <td style="color: #386ca8;">
                Média: <strong>${mostrar(dia.umi.media)}%</strong><br>
                <small style="color: #777;">Máx: ${mostrar(dia.umi.max)}% | Mín: ${mostrar(dia.umi.min)}%</small>
            </td>
            <td style="color: #d6aa24;">
                Média: <strong>${mostrar(dia.lux.media)} lux</strong><br>
                <small style="color: #777;">Máx: ${mostrar(dia.lux.max)} lux | Mín: ${mostrar(dia.lux.min)} lux</small>
            </td>
        `;

        tabela.appendChild(tr);
    });

    if (containerBotao) {
        if (resumoDiario.length > LIMITE_INICIAL) {
            const restantes = resumoDiario.length - LIMITE_INICIAL;
            const textoBotao = tabelaExpandida ? "Ver menos ▲" : `Ver mais (${restantes} restantes) ▼`;

            containerBotao.innerHTML = `
                <button id="btnVerMais" style="
                    background: transparent;
                    color: #2e7d32;
                    border: none;
                    padding: 6px 12px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 14px;
                    text-decoration: none;
                ">
                    ${textoBotao}
                </button>
            `;

            const btn = document.getElementById("btnVerMais");
            if (btn) {
                btn.addEventListener("mouseenter", () => btn.style.textDecoration = "underline");
                btn.addEventListener("mouseleave", () => btn.style.textDecoration = "none");
                btn.addEventListener("click", () => {
                    tabelaExpandida = !tabelaExpandida;
                    renderizarTabela(resumoDiario);
                });
            }
        } else {
            containerBotao.innerHTML = "";
        }
    }
}


// ==========================================
// ATUALIZAR TEXTO
// ==========================================

function atualizarTextoPorSeletor(seletor, valor) {
    const el = document.querySelector(seletor);
    if (el) {
        el.textContent = valor;
    }
}


// ==========================================
// LIMPAR INTERFACE
// ==========================================

function limparInterface(mensagem = "Nenhum dado recebido.") {
    const tabela = document.getElementById("tabelaDados") || document.querySelector("tbody");
    const containerBotao = document.getElementById("containerVerMais");

    if (tabela) {
        tabela.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding:20px;">
                    ${mensagem}
                </td>
            </tr>
        `;
    }

    if (containerBotao) {
        containerBotao.innerHTML = "";
    }

    atualizarTextoPorSeletor("#mediaTemperatura, .card-temp .valor, .card:nth-child(1) h2", "— °C");
    atualizarTextoPorSeletor("#minTemperatura, .card-temp .min", "—");
    atualizarTextoPorSeletor("#maxTemperatura, .card-temp .max", "—");

    atualizarTextoPorSeletor("#mediaUmidade, .card-umi .valor, .card:nth-child(2) h2", "— %");
    atualizarTextoPorSeletor("#minUmidade, .card-umi .min", "—");
    atualizarTextoPorSeletor("#maxUmidade, .card-umi .max", "—");

    atualizarTextoPorSeletor("#mediaLuminosidade, .card-lux .valor, .card:nth-child(3) h2", "— lux");
    atualizarTextoPorSeletor("#minLuminosidade, .card-lux .min", "0");
    atualizarTextoPorSeletor("#maxLuminosidade, .card-lux .max", "0");

    atualizarTextoPorSeletor("#percentTemperatura", "—");
    atualizarTextoPorSeletor("#percentUmidade", "—");
    atualizarTextoPorSeletor("#percentLuminosidade", "—");

    if (graficoLinha) {
        graficoLinha.data.labels = [];
        graficoLinha.data.datasets.forEach(dataset => dataset.data = []);
        graficoLinha.update();
    }

    if (graficoRosca) {
        graficoRosca.data.datasets[0].data = [0, 0, 0];
        graficoRosca.update();
    }
}


// ==========================================
// CONSULTAR HISTÓRICO
// ==========================================

let consultaAtual = 0;
async function consultarHistorico() {
    const id = ++consultaAtual;
    try {
        const dados = await buscarDadosAPI();
        if (id === consultaAtual) atualizarInterface(dados);
    } catch (erro) {
        console.error(erro);
        if (id === consultaAtual) limparInterface("Não foi possível consultar o histórico. Verifique a API e o período.");
    }
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // Inicializa os gráficos
    inicializarGraficos();

    // Faz a primeira consulta ao carregar a página
    consultarHistorico();

    // Configura atualização automática periódica
    if (INTERVALO_API_MS > 0) {
        setInterval(consultarHistorico, INTERVALO_API_MS);
    }

    // Eventos para filtros (se houverem na tela)
    const selectPeriodo = document.getElementById("periodo");
    if (selectPeriodo) {
        selectPeriodo.addEventListener("change", () => {
            document.getElementById("dataInicial").value = "";
            document.getElementById("dataFinal").value = "";
            consultarHistorico();
        });
    }

    const inputInicio = document.getElementById("dataInicial");
    const inputFim = document.getElementById("dataFinal");
    if (inputInicio && inputFim) {
        inputInicio.addEventListener("change", consultarHistorico);
        inputFim.addEventListener("change", consultarHistorico);
    }
});