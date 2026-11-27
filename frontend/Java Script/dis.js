// =====================================================
// CONFIGURAÇÕES DA API E DOS SENSORES
// =====================================================

// A URL da API e o intervalo de busca ficam em sensores.js

let sensores = {
    temperatura: {
        ativo: false,
        ultimoDado: null
    },
    umidade: {
        ativo: false,
        ultimoDado: null
    },
    luminosidade: {
        ativo: false,
        ultimoDado: null
    }
};

// Tempo máximo sem receber dados para considerar o sensor inativo (5 segundos)
const TEMPO_LIMITE = 5000;


// =====================================================
// RELÓGIO
// =====================================================
function atualizarRelogio() {
    const agora = new Date();
    const hora = agora.toLocaleTimeString("pt-BR");
    const relogio = document.getElementById("relogio");

    if (relogio) {
        relogio.textContent = hora;
    }
}

atualizarRelogio();
setInterval(atualizarRelogio, 1000);


// =====================================================
// BUSCAR DADOS DA API (VINCULADO AO UTILIZADOR LOGADO)
// =====================================================
// (A busca na API agora é feita pelo sensores.js e compartilhada entre as telas)


// =====================================================
// ATUALIZAR STATUS DOS SENSORES
// =====================================================
function atualizarStatusSensor(nomeSensor, ativo) {
    let elemento = null;

    if (nomeSensor === "temperatura") {
        elemento = document.getElementById("statusTemperatura");
    }
    if (nomeSensor === "umidade") {
        elemento = document.getElementById("statusUmidade");
    }
    if (nomeSensor === "luminosidade") {
        elemento = document.getElementById("statusLuminosidade");
    }

    if (!elemento) {
        return;
    }

    // SENSOR ATIVO
    if (ativo) {
        elemento.className = "status-ativo";
        elemento.innerHTML = "● Ativo";
    }
    // SENSOR INATIVO
    else {
        elemento.className = "status-inativo";
        elemento.innerHTML = "● Inativo";
    }
}


// =====================================================
// ATUALIZAR STATUS DO ARDUINO
// =====================================================
function atualizarStatusArduino() {
    const statusArduino = document.getElementById("statusArduino");

    if (!statusArduino) {
        return;
    }

    // Verifica se algum sensor está ativo
    const algumSensorAtivo =
        sensores.temperatura.ativo ||
        sensores.umidade.ativo ||
        sensores.luminosidade.ativo;

    // ARDUINO ONLINE
    if (algumSensorAtivo) {
        statusArduino.className = "status-online";
        statusArduino.innerHTML = "● Online";
    }
    // ARDUINO OFFLINE
    else {
        statusArduino.className = "status-offline";
        statusArduino.innerHTML = "● Offline";
    }
}


// =====================================================
// RECEBER TEMPERATURA
// =====================================================
function receberTemperatura(valor) {
    sensores.temperatura.ultimoDado = Date.now();
    sensores.temperatura.ativo = true;
    
    const elemento = document.getElementById("temperaturaAtual");
    if (elemento) {
        elemento.textContent = valor + " °C";
    }
    
    atualizarStatusSensor("temperatura", true);
    atualizarStatusArduino();
}


// =====================================================
// RECEBER UMIDADE
// =====================================================
function receberUmidade(valor) {
    sensores.umidade.ultimoDado = Date.now();
    sensores.umidade.ativo = true;
    
    const elemento = document.getElementById("umidadeAtual");
    if (elemento) {
        elemento.textContent = valor + " %";
    }
    
    atualizarStatusSensor("umidade", true);
    atualizarStatusArduino();
}


// =====================================================
// RECEBER LUMINOSIDADE
// =====================================================
function receberLuminosidade(valor) {
    sensores.luminosidade.ultimoDado = Date.now();
    sensores.luminosidade.ativo = true;
    
    const elemento = document.getElementById("luminosidadeAtual");
    if (elemento) {
        elemento.textContent = valor + " lux";
    }
    
    atualizarStatusSensor("luminosidade", true);
    atualizarStatusArduino();
}


// =====================================================
// RECEBER TODOS OS DADOS
// =====================================================
function adicionarLeitura(temp, umi, lux) {
    if (temp !== null && temp !== undefined) {
        receberTemperatura(temp);
    }
    if (umi !== null && umi !== undefined) {
        receberUmidade(umi);
    }
    if (lux !== null && lux !== undefined) {
        receberLuminosidade(lux);
    }
}


// =====================================================
// VERIFICAR SENSORES (TIMEOUT DE INATIVIDADE)
// =====================================================
function verificarSensores() {
    const agora = Date.now();

    // TEMPERATURA
    if (sensores.temperatura.ultimoDado !== null && (agora - sensores.temperatura.ultimoDado > TEMPO_LIMITE)) {
        sensores.temperatura.ativo = false;
        atualizarStatusSensor("temperatura", false);
    }

    // UMIDADE
    if (sensores.umidade.ultimoDado !== null && (agora - sensores.umidade.ultimoDado > TEMPO_LIMITE)) {
        sensores.umidade.ativo = false;
        atualizarStatusSensor("umidade", false);
    }

    // LUMINOSIDADE
    if (sensores.luminosidade.ultimoDado !== null && (agora - sensores.luminosidade.ultimoDado > TEMPO_LIMITE)) {
        sensores.luminosidade.ativo = false;
        atualizarStatusSensor("luminosidade", false);
    }

    // Verifica novamente o estado geral do Arduino
    atualizarStatusArduino();
}

setInterval(verificarSensores, 1000);


// =====================================================
// INICIALIZAÇÃO
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
    atualizarStatusSensor("temperatura", false);
    atualizarStatusSensor("umidade", false);
    atualizarStatusSensor("luminosidade", false);
    atualizarStatusArduino();

    // Recebe as leituras do módulo compartilhado (sensores.js).
    // Cada sensor só fica "Ativo" se a API disser que ele enviou dado recentemente.
    SensoresAPI.aoReceber(l => {
        const online = l.online !== false;
        const lista = [
            ["temperatura", l.temperatura, receberTemperatura],
            ["umidade", l.umidade, receberUmidade],
            ["luminosidade", l.luminosidade, receberLuminosidade]
        ];
        lista.forEach(([nome, valor, mostrar]) => {
            const ativoNaApi = nome in (l.ativos || {}) ? l.ativos[nome] : true;
            if (online && ativoNaApi && valor !== null && valor !== undefined) {
                mostrar(valor);
            } else {
                sensores[nome].ativo = false;
                atualizarStatusSensor(nome, false);
            }
        });
        atualizarStatusArduino();

        const ultima = document.getElementById("ultimaAtualizacao");
        if (ultima && l.ultimaAtualizacao) {
            ultima.textContent = new Date(l.ultimaAtualizacao).toLocaleTimeString("pt-BR");
        }
    }, { replay: false });
    SensoresAPI.iniciar();
});
