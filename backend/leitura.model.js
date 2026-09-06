import { conexaoBancoDados } from '../config/banco-dados.js';

export async function salvarLeitura(dadosLeitura) {
    const dataHora = new Date();

    const leituras = [
        {
            valor: dadosLeitura.temperatura,
            idSensor: 1
        },
        {
            valor: dadosLeitura.umidade,
            idSensor: 2
        },
        {
            valor: dadosLeitura.luminosidadeLux,
            idSensor: 3
        }
    ];

    const comandoSql = `
        INSERT INTO Leitura (valor, dataHora, idSensor)
        VALUES (?, ?, ?)
    `;

    for (const leitura of leituras) {
        await conexaoBancoDados.execute(comandoSql, [
            leitura.valor,
            dataHora,
            leitura.idSensor
        ]);
    }

    return {
        dispositivo: dadosLeitura.dispositivo,
        numeroLeitura: dadosLeitura.numeroLeitura,
        temperatura: dadosLeitura.temperatura,
        umidade: dadosLeitura.umidade,
        luminosidadeLux: dadosLeitura.luminosidadeLux,
        tempoMillis: dadosLeitura.tempoMillis,
        dataHora
    };
}

export async function listarLeituras() {
    const comandoSql = `
        SELECT
            l.idLeitura,
            s.tipo AS sensor,
            l.valor,
            l.dataHora
        FROM Leitura l
        INNER JOIN Sensor s
            ON l.idSensor = s.idSensor
        ORDER BY l.dataHora DESC, l.idLeitura DESC
        LIMIT 100
    `;

    const [linhas] = await conexaoBancoDados.execute(comandoSql);

    return linhas.map((linha) => ({
        idLeitura: linha.idLeitura,
        sensor: linha.sensor,
        valor: Number(linha.valor),
        dataHora: linha.dataHora
    }));
}

export async function buscarUltimaLeitura() {
    const comandoSql = `
        SELECT
            l.valor,
            l.dataHora,
            s.tipo AS sensor
        FROM Leitura l
        INNER JOIN Sensor s
            ON l.idSensor = s.idSensor
        ORDER BY l.dataHora DESC, l.idLeitura DESC
        LIMIT 3
    `;

    const [linhas] = await conexaoBancoDados.execute(comandoSql);

    if (linhas.length === 0) {
        return null;
    }

    const ultimaLeitura = {
        dataHora: linhas[0].dataHora,
        temperatura: null,
        umidade: null,
        luminosidadeLux: null
    };

    for (const linha of linhas) {
        if (linha.sensor === 'temperatura') {
            ultimaLeitura.temperatura = Number(linha.valor);
        }

        if (linha.sensor === 'umidade') {
            ultimaLeitura.umidade = Number(linha.valor);
        }

        if (linha.sensor === 'luminosidade') {
            ultimaLeitura.luminosidadeLux = Number(linha.valor);
        }
    }

    return ultimaLeitura;
}