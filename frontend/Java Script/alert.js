// ==========================================
// ALERTAS (vindos da API)
// ==========================================
// Os alertas são gerados pela API a cada leitura do Arduino e ficam guardados lá.
// Endpoints: GET /api/alertas, PUT /api/alertas/:id (ciente), DELETE /api/alertas
// O endereço base da API fica em ../config.js

let meuGrafico = null;
let mostrandoTodos = false;
const LIMITE_EXIBICAO_INICIAL = 4;
const INTERVALO_ALERTAS_MS = 5000;

let listaAlertas = [];
let assinaturaAnterior = null;

// RELÓGIO DIGITAL EM TEMPO REAL
function atualizarRelogio() {
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');

    const relogioElemento = document.getElementById('relogio');
    if (relogioElemento) {
        relogioElemento.textContent = `${horas}:${minutos}:${segundos}`;
    }
}
setInterval(atualizarRelogio, 1000);
atualizarRelogio();

// 1. CONVERTER O ALERTA DA API PARA O FORMATO DA TELA
const ICONES = {
    temperatura: { alta: "fas fa-temperature-high", baixa: "fas fa-temperature-low" },
    umidade: { alta: "fas fa-tint", baixa: "fas fa-tint-slash" },
    luminosidade: { alta: "fas fa-sun", baixa: "fas fa-moon" }
};

function formatarTempo(iso) {
    const d = new Date(iso);
    const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return d.toDateString() === new Date().toDateString()
        ? `Hoje às ${hm}`
        : `${d.toLocaleDateString('pt-BR')} às ${hm}`;
}

function deApi(a) {
    const critico = a.nivel === 'critico';
    const categoria = a.sensor.charAt(0).toUpperCase() + a.sensor.slice(1);
    let descricao = a.direcao === 'alta'
        ? 'O valor está acima do limite configurado.'
        : 'O valor está abaixo do limite configurado.';
    if (a.status === 'resolvido') descricao = 'Valor já voltou à faixa normal.';

    return {
        id: a.id,
        titulo: String(a.titulo || '').toUpperCase(),
        descricao,
        detalhes: a.detalhes || '',
        nivel: critico ? 'Crítico' : 'Atenção',
        categoria,
        status: a.ciencia === 'ciente' ? 'Ciente' : 'Pendente',
        icone: (ICONES[a.sensor] || ICONES.temperatura)[a.direcao] || 'fas fa-exclamation-triangle',
        corClasse: critico ? 'vermelho' : (a.sensor === 'luminosidade' ? 'amarelo' : 'laranja'),
        tempo: formatarTempo(a.criadoEm)
    };
}

// 2. BUSCAR ALERTAS NA API
async function carregarAlertas() {
    try {
        const resposta = await apiFetch('/api/alertas?limite=1000', { cache: 'no-cache' });
        if (!resposta.ok) throw new Error('Erro HTTP: ' + resposta.status);
        const dados = await resposta.json();
        const lista = (dados.data || []).map(deApi);

        // Só redesenha (e recria o gráfico) quando algo mudou
        const assinatura = JSON.stringify(lista);
        if (assinatura === assinaturaAnterior) return;
        assinaturaAnterior = assinatura;
        listaAlertas = lista;
        renderizarAlertas();
    } catch (erro) {
        console.error('Erro ao buscar alertas:', erro);
    }
}

// 3. MARCAR COMO CIENTE (salvo na API)
async function marcarComoCiente(id) {
    try {
        const resposta = await apiFetch(`/api/alertas/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ciencia: 'ciente' })
        });
        if (!resposta.ok) {
            const r = await resposta.json().catch(() => ({}));
            throw new Error(r.message || 'Erro ao marcar como ciente.');
        }
        await carregarAlertas();
    } catch (erro) {
        console.error(erro);
        alert(erro.message || 'Não foi possível marcar como ciente. Tente novamente.');
    }
}

// 4. RENDERIZAR TELA
function renderizarAlertas() {
    const container = document.getElementById('lista-alertas-container');
    if (!container) return;

    const filtroNivelEl = document.getElementById('filtro-nivel');
    const filtroStatusEl = document.getElementById('filtro-status');
    const filtroSensorEl = document.getElementById('filtro-sensor');

    const selectNivel = filtroNivelEl ? filtroNivelEl.value.toLowerCase() : 'todos';
    const selectStatus = filtroStatusEl ? filtroStatusEl.value.toLowerCase() : 'todos';

    const selectSensor = filtroSensorEl ? filtroSensorEl.value.toLowerCase() : 'todos';

    const alertasFiltrados = listaAlertas.filter(alerta => {
        const nivelAlerta = (alerta.nivel || '').toLowerCase();
        const statusAlerta = (alerta.status || '').toLowerCase();

        const atendeNivel = selectNivel === 'todos' || nivelAlerta === selectNivel;
        
        let atendeStatus = true;
        if (selectStatus === 'pendente') {
            atendeStatus = statusAlerta === 'pendente';
        } else if (selectStatus === 'ciente') {
            atendeStatus = statusAlerta === 'ciente';
        }

        const atendeSensor = selectSensor === 'todos' || (alerta.categoria || '').toLowerCase() === selectSensor;
        return atendeNivel && atendeStatus && atendeSensor;
    });

    container.innerHTML = "";

    if (alertasFiltrados.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; color: #777; width: 100%;">
                <div style="display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; background-color: #34753c; color: #fff; border-radius: 50%; margin-bottom: 12px; font-size: 20px;">
                    <i class="fas fa-check"></i>
                </div>
                <p style="font-size: 15px; font-weight: bold; color: #333; margin: 0 0 4px 0;">Nenhum alerta encontrado!</p>
                <p style="font-size: 13px; color: #777; margin: 0;">Não há registros para os filtros selecionados no momento.</p>
            </div>
        `;
    } else {
        const alertasExibidos = mostrandoTodos 
            ? alertasFiltrados 
            : alertasFiltrados.slice(0, LIMITE_EXIBICAO_INICIAL);

        alertasExibidos.forEach(alerta => {
            const badgeClass = alerta.nivel === 'Crítico' ? 'critico-badge' : 'atencao-badge';
            const ehCiente = alerta.status === 'Ciente';
            
            const acaoHtml = ehCiente
                ? `<span class="status-ciente-tag" style="color: #2e7d32; font-weight: bold; font-size: 13px; display: flex; align-items: center; gap: 4px;">
                    <i class="fas fa-check"></i> Ciente
                   </span>`
                : `<button class="btn-ciente" onclick="marcarComoCiente('${alerta.id}')" style="padding: 6px 12px; background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 12px; transition: 0.2s; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-eye"></i> Marcar como ciente
                   </button>`;

            const itemHTML = `
                <div class="alerta-item ${ehCiente ? 'alerta-ciente' : ''}">
                    <div class="icone-alerta ${alerta.corClasse}">
                        <i class="${alerta.icone}"></i>
                    </div>
                    <div class="info-alerta">
                        <h3>${alerta.titulo}</h3>
                        <p>${alerta.descricao}</p>
                        <span>${alerta.detalhes}</span>
                    </div>
                    <div class="status-alerta">
                        <span class="badge ${badgeClass}">${alerta.nivel}</span>
                        <small><i class="far fa-clock"></i> ${alerta.tempo}</small>
                    </div>
                    <div class="acoes-alerta">
                        ${acaoHtml}
                    </div>
                </div>
            `;
            container.innerHTML += itemHTML;
        });

        if (alertasFiltrados.length > LIMITE_EXIBICAO_INICIAL) {
            const quantidadeRestante = alertasFiltrados.length - LIMITE_EXIBICAO_INICIAL;
            const textoBotao = mostrandoTodos 
                ? '<i class="fas fa-chevron-up"></i> Ver menos' 
                : `<i class="fas fa-chevron-down"></i> Ver mais (+${quantidadeRestante} notificações)`;

            container.innerHTML += `
                <div style="text-align: center; margin-top: 15px;">
                    <button id="btn-ver-mais" style="padding: 8px 18px; background: transparent; border: 1px solid #ccc; border-radius: 20px; color: #555; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s;">
                        ${textoBotao}
                    </button>
                </div>
            `;

            document.getElementById('btn-ver-mais').addEventListener('click', () => {
                mostrandoTodos = !mostrandoTodos;
                renderizarAlertas();
            });
        }
    }

    atualizarCardsResumo();
    atualizarGraficoJS();
}

// 5. ATUALIZAR CARDS DE RESUMO
function atualizarCardsResumo() {
    const criticos = listaAlertas.filter(a => a.nivel === 'Crítico').length;
    const atencao = listaAlertas.filter(a => a.nivel === 'Atenção').length;
    const total = listaAlertas.length;

    const elCriticos = document.getElementById('card-criticos');
    const elAtencao = document.getElementById('card-atencao');
    const elNormais = document.getElementById('card-normais');
    const elTotal = document.getElementById('card-total');
    const elGraficoCentro = document.getElementById('total-grafico-centro');

    if (elCriticos) elCriticos.textContent = criticos;
    if (elAtencao) elAtencao.textContent = atencao;
    if (elNormais) elNormais.textContent = total === 0 ? 1 : 0;
    if (elTotal) elTotal.textContent = total;
    if (elGraficoCentro) elGraficoCentro.textContent = total;
}

// 6. RENDERIZAR GRÁFICO CIRCULAR DO CHART.JS
function atualizarGraficoJS() {
    const canvas = document.getElementById('graficoAlertas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const contagem = {
        Temperatura: listaAlertas.filter(a => a.categoria === 'Temperatura').length,
        Umidade: listaAlertas.filter(a => a.categoria === 'Umidade').length,
        Luminosidade: listaAlertas.filter(a => a.categoria === 'Luminosidade').length,
        Dispositivos: listaAlertas.filter(a => a.categoria === 'Dispositivos').length
    };

    const semDados = listaAlertas.length === 0;
    const dataValues = semDados ? [1] : [contagem.Temperatura, contagem.Umidade, contagem.Luminosidade, contagem.Dispositivos];
    const bgColors = semDados ? ['#e0e0e0'] : ['#d93636', '#3676bd', '#f2bd13', '#f58216'];
    const labels = semDados ? ['Sem Alertas'] : ['Temperatura', 'Umidade', 'Luminosidade', 'Dispositivos'];

    if (meuGrafico) {
        meuGrafico.destroy();
    }

    meuGrafico = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: bgColors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 10, font: { size: 11 } }
                }
            }
        }
    });
}

// 7. INICIALIZAÇÃO E EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    const filtroNivelEl = document.getElementById('filtro-nivel');
    const filtroStatusEl = document.getElementById('filtro-status');
    const filtroSensorEl = document.getElementById('filtro-sensor');
    const btnLimparEl = document.getElementById('btn-limpar-filtros');

    if (filtroNivelEl) filtroNivelEl.addEventListener('change', renderizarAlertas);
    if (filtroStatusEl) filtroStatusEl.addEventListener('change', renderizarAlertas);
    if (filtroSensorEl) filtroSensorEl.addEventListener('change', renderizarAlertas);

    if (btnLimparEl) {
        btnLimparEl.addEventListener('click', async () => {
            if (listaAlertas.length === 0) {
                alert("Não há notificações para apagar.");
                return;
            }

            if (confirm("Tem certeza que deseja apagar todas as notificações?")) {
                try {
                    // Endpoint: DELETE /api/alertas (limpa os alertas do usuário logado)
                    const resposta = await apiFetch('/api/alertas', { method: 'DELETE' });
                    if (!resposta.ok) throw new Error('Erro HTTP: ' + resposta.status);
                } catch (erro) {
                    console.error(erro);
                    alert("Não foi possível apagar as notificações. Tente novamente.");
                    return;
                }

                if (filtroNivelEl) filtroNivelEl.value = 'todos';
                if (filtroStatusEl) filtroStatusEl.value = 'todos';
                if (filtroSensorEl) filtroSensorEl.value = 'todos';
                mostrandoTodos = false;
                assinaturaAnterior = null;
                await carregarAlertas();
            }
        });
    }

    // Renderização inicial (vazia) e busca periódica; pausa com a aba em segundo plano
    renderizarAlertas();
    carregarAlertas();
    let timer = setInterval(carregarAlertas, INTERVALO_ALERTAS_MS);
    document.addEventListener('visibilitychange', () => {
        clearInterval(timer);
        if (!document.hidden) {
            carregarAlertas();
            timer = setInterval(carregarAlertas, INTERVALO_ALERTAS_MS);
        }
    });
});
