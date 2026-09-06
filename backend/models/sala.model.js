import { conexaoBancoDados } from '../config/banco-dados.js';

export async function criarSala(dadosSala) {
    const comandoSql = `
        INSERT INTO Sala (
            nome,
            descricao,
            tempMin,
            tempMax,
            umidadeMin,
            umidadeMax,
            luxMin,
            luxMax,
            idUsuario
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        dadosSala.nome,
        dadosSala.descricao,
        dadosSala.tempMin,
        dadosSala.tempMax,
        dadosSala.umidadeMin,
        dadosSala.umidadeMax,
        dadosSala.luxMin,
        dadosSala.luxMax,
        dadosSala.idUsuario
    ];

    const [resultado] = await conexaoBancoDados.execute(comandoSql, valores);

    return {
        idSala: resultado.insertId,
        ...dadosSala
    };
}

export async function listarSalas() {
    const comandoSql = `
        SELECT *
        FROM Sala
        ORDER BY idSala DESC
    `;

    const [linhas] = await conexaoBancoDados.execute(comandoSql);

    return linhas;
}

export async function buscarSalaPorId(idSala) {
    const comandoSql = `
        SELECT *
        FROM Sala
        WHERE idSala = ?
    `;

    const [linhas] = await conexaoBancoDados.execute(comandoSql, [idSala]);

    if (linhas.length === 0) {
        return null;
    }

    return linhas[0];
}

export async function atualizarSala(idSala, dadosSala) {
    const comandoSql = `
        UPDATE Sala
        SET
            nome = ?,
            descricao = ?,
            tempMin = ?,
            tempMax = ?,
            umidadeMin = ?,
            umidadeMax = ?,
            luxMin = ?,
            luxMax = ?,
            idUsuario = ?
        WHERE idSala = ?
    `;

    const valores = [
        dadosSala.nome,
        dadosSala.descricao,
        dadosSala.tempMin,
        dadosSala.tempMax,
        dadosSala.umidadeMin,
        dadosSala.umidadeMax,
        dadosSala.luxMin,
        dadosSala.luxMax,
        dadosSala.idUsuario,
        idSala
    ];

    const [resultado] = await conexaoBancoDados.execute(comandoSql, valores);

    return resultado.affectedRows > 0;
}

export async function deletarSala(idSala) {
    const comandoSql = `
        DELETE FROM Sala
        WHERE idSala = ?
    `;

    const [resultado] = await conexaoBancoDados.execute(comandoSql, [idSala]);

    return resultado.affectedRows > 0;
}
