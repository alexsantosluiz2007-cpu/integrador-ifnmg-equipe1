// =====================================================
// CONFIGURAÇÃO DOS SENSORES
// =====================================================

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


// =====================================================
// TEMPO MÁXIMO SEM RECEBER DADOS
// =====================================================

// 5000 = 5 segundos
const TEMPO_LIMITE = 5000;


// =====================================================
// RELÓGIO
// =====================================================
function atualizarRelogio() {
    const agora = new Date();
    const hora = agora.toLocaleTimeString("pt-BR");
    const relogio = document.getElementById("relogio");
    const ultimaAtualizacao =
        document.getElementById("ultimaAtualizacao");

    if (relogio) {
        relogio.textContent = hora;
    }
    if (ultimaAtualizacao) {
        ultimaAtualizacao.textContent = hora;
    }
}

atualizarRelogio();
setInterval(atualizarRelogio, 1000);

// =====================================================
// ATUALIZAR STATUS DOS SENSORES
// =====================================================
function atualizarStatusSensor(nomeSensor, ativo) {
    let elemento = null;

    if (nomeSensor === "temperatura") {
        elemento =
            document.getElementById("statusTemperatura");
    }

    if (nomeSensor === "umidade") {
        elemento =
            document.getElementById("statusUmidade");
    }

    if (nomeSensor === "luminosidade") {
        elemento =
            document.getElementById("statusLuminosidade");
    }

    if (!elemento) {
        return;
    }

    // SENSOR ATIVO
    if (ativo) {
        elemento.className = "status-ativo";
        elemento.innerHTML =
            "● Ativo";
    }

    // SENSOR INATIVO
    else {
        elemento.className = "status-inativo";
        elemento.innerHTML =
            "● Inativo";
    }
}

// =====================================================
// ATUALIZAR STATUS DO ARDUINO
// =====================================================
function atualizarStatusArduino() {
    const statusArduino =
        document.getElementById("statusArduino");

    if (!statusArduino) {
        return;
    }
    // Verifica se algum sensor está ativo
    const algumSensorAtivo =
        sensores.temperatura.ativo ||
        sensores.umidade.ativo ||
        sensores.luminosidade.ativo;
    // =================================================
    // ARDUINO ONLINE
    // =================================================
    if (algumSensorAtivo) {
        statusArduino.className =
            "status-online";
        statusArduino.innerHTML =
            "● Online";
    }
    // =================================================
    // ARDUINO OFFLINE
    // =================================================
    else {
        statusArduino.className =
            "status-offline";

        statusArduino.innerHTML =
            "● Offline";
    }
}

// =====================================================
// RECEBER TEMPERATURA
// =====================================================
function receberTemperatura(valor) {
    sensores.temperatura.ultimoDado =
        Date.now();
    sensores.temperatura.ativo =
        true;
    const elemento =
        document.getElementById("temperaturaAtual");
    if (elemento) {
        elemento.textContent =
            valor + " °C";

    }
    atualizarStatusSensor(
        "temperatura",
        true
    );
    atualizarStatusArduino();
}

// =====================================================
// RECEBER UMIDADE
// =====================================================
function receberUmidade(valor) {
    sensores.umidade.ultimoDado =
        Date.now();
    sensores.umidade.ativo =
        true;
    const elemento =
        document.getElementById("umidadeAtual");
    if (elemento) {
        elemento.textContent =
            valor + " %";
    }
    atualizarStatusSensor(
        "umidade",
        true
    );
    atualizarStatusArduino();
}

// =====================================================
// RECEBER LUMINOSIDADE
// =====================================================
function receberLuminosidade(valor) {
    sensores.luminosidade.ultimoDado =
        Date.now();
    sensores.luminosidade.ativo =
        true;
    const elemento =
        document.getElementById("luminosidadeAtual");
    if (elemento) {
        elemento.textContent =
            valor + " lux";
    }
    atualizarStatusSensor(
        "luminosidade",
        true
    );
    atualizarStatusArduino();
}

// =====================================================
// RECEBER TODOS OS DADOS
// =====================================================
function adicionarLeitura(temp, umi, lux) {
    if (
        temp !== null &&
        temp !== undefined
    ) {
        receberTemperatura(temp);
    }

    if (
        umi !== null &&
        umi !== undefined
    ) {
        receberUmidade(umi);
    }
    if (
        lux !== null &&
        lux !== undefined
    ) {

        receberLuminosidade(lux);
    }

    const ultimaAtualizacao =
        document.getElementById("ultimaAtualizacao");
    if (ultimaAtualizacao) {
        ultimaAtualizacao.textContent =
            new Date().toLocaleTimeString("pt-BR");
    }
}
// =====================================================
// VERIFICAR SENSORES
// =====================================================

function verificarSensores() {
    const agora = Date.now();
    // =================================================
    // TEMPERATURA
    // =================================================
    if (
        sensores.temperatura.ultimoDado !== null &&
        agora -
        sensores.temperatura.ultimoDado >
        TEMPO_LIMITE
    ) {
        sensores.temperatura.ativo =
            false;
        atualizarStatusSensor(
            "temperatura",
            false
        );
    }


    // =================================================
    // UMIDADE
    // =================================================

    if (
        sensores.umidade.ultimoDado !== null &&
        agora -
        sensores.umidade.ultimoDado >
        TEMPO_LIMITE
    ) {
        sensores.umidade.ativo =
            false;
        atualizarStatusSensor(
            "umidade",
            false
        );
    }

    // =================================================
    // LUMINOSIDADE
    // =================================================
    if (
        sensores.luminosidade.ultimoDado !== null &&
        agora -
        sensores.luminosidade.ultimoDado >
        TEMPO_LIMITE
    ) {
        sensores.luminosidade.ativo =
            false;
        atualizarStatusSensor(
            "luminosidade",
            false
        );
    }

    // Verifica novamente o Arduino
    atualizarStatusArduino();
}
setInterval(
    verificarSensores,
    1000
);


// =====================================================
// ESTADO INICIAL
// =====================================================
atualizarStatusSensor(
    "temperatura",
    false
);
atualizarStatusSensor(
    "umidade",
    false
);
atualizarStatusSensor(
    "luminosidade",
    false
);
atualizarStatusArduino();













