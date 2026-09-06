import { conexaoBancoDados } from '../config/banco-dados.js';

export async function criarAlerta(dadosAlerta) {
    const comandoSql = `
        INSERT INTO Alerta (tipo, dataHora, idSensor)
        VALUES (?, ?, ?)
    `;

    const valores = [
        dadosAlerta.tipo,
        new Date(),
        dadosAlerta.idSensor
    ];

    const [resultado] = await conexaoBancoDados.execute(comandoSql, valores);

    return {
        idAlerta: resultado.insertId,
        tipo: dadosAlerta.tipo,
        dataHora: valores[1],
        idSensor: dadosAlerta.idSensor
    };
}

export async function listarAlertas() {
    const comandoSql = `
        SELECT
            a.idAlerta,
            a.tipo,
            a.dataHora,
            a.idSensor,
            s.tipo AS tipoSensor
        FROM Alerta a
        INNER JOIN Sensor s
            ON a.idSensor = s.idSensor
        ORDER BY a.dataHora DESC
    `;

    const [linhas] = await conexaoBancoDados.execute(comandoSql);

    return linhas;
}

export async function buscarAlertaPorId(idAlerta) {
    const comandoSql = `
        SELECT
            a.idAlerta,
            a.tipo,
            a.dataHora,
            a.idSensor,
            s.tipo AS tipoSensor
        FROM Alerta a
        INNER JOIN Sensor s
            ON a.idSensor = s.idSensor
        WHERE a.idAlerta = ?
    `;

    const [linhas] = await conexaoBancoDados.execute(comandoSql, [idAlerta]);

    if (linhas.length === 0) {
        return null;
    }

    return linhas[0];
}

export async function deletarAlerta(idAlerta) {
    const comandoSql = `
        DELETE FROM Alerta
        WHERE idAlerta = ?
    `;

    const [resultado] = await conexaoBancoDados.execute(comandoSql, [idAlerta]);

    return resultado.affectedRows > 0;
}