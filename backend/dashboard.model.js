import { conexaoBancoDados } from '../config/banco-dados.js';

export async function buscarDadosDashboard() {
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

    const dadosDashboard = {
        temperatura: null,
        umidade: null,
        luminosidadeLux: null,
        status: 'normal',
        dataHora: linhas[0].dataHora
    };

    for (const linha of linhas) {
        if (linha.sensor === 'temperatura') {
            dadosDashboard.temperatura = Number(linha.valor);
        }

        if (linha.sensor === 'umidade') {
            dadosDashboard.umidade = Number(linha.valor);
        }

        if (linha.sensor === 'luminosidade') {
            dadosDashboard.luminosidadeLux = Number(linha.valor);
        }
    }

    return dadosDashboard;
}