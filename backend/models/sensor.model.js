import { conexaoBancoDados } from '../config/banco-dados.js';

export async function criarSensor(dadosSensor) {
    const comandoSql = `
        INSERT INTO Sensor (tipo, status, idSala)
        VALUES (?, ?, ?)
    `;

    const valores = [
        dadosSensor.tipo,
        dadosSensor.status,
        dadosSensor.idSala
    ];

    const [resultado] = await conexaoBancoDados.execute(comandoSql, valores);

    return {
        idSensor: resultado.insertId,
        ...dadosSensor
    };
}

export async function listarSensores() {
    const comandoSql = `
        SELECT *
        FROM Sensor
        ORDER BY idSensor DESC
    `;

    const [linhas] = await conexaoBancoDados.execute(comandoSql);

    return linhas;
}

export async function buscarSensorPorId(idSensor) {
    const comandoSql = `
        SELECT *
        FROM Sensor
        WHERE idSensor = ?
    `;

    const [linhas] = await conexaoBancoDados.execute(comandoSql, [idSensor]);

    if (linhas.length === 0) {
        return null;
    }

    return linhas[0];
}

export async function atualizarSensor(idSensor, dadosSensor) {
    const comandoSql = `
        UPDATE Sensor
        SET tipo = ?, status = ?, idSala = ?
        WHERE idSensor = ?
    `;

    const valores = [
        dadosSensor.tipo,
        dadosSensor.status,
        dadosSensor.idSala,
        idSensor
    ];

    const [resultado] = await conexaoBancoDados.execute(comandoSql, valores);

    return resultado.affectedRows > 0;
}

export async function deletarSensor(idSensor) {
    const comandoSql = `
        DELETE FROM Sensor
        WHERE idSensor = ?
    `;

    const [resultado] = await conexaoBancoDados.execute(comandoSql, [idSensor]);

    return resultado.affectedRows > 0;
}
