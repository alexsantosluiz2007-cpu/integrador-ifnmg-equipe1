import { conexaoBancoDados } from '../config/banco-dados.js';

export async function criarUsuario(dadosUsuario) {
    const comandoSql = `
        INSERT INTO Usuario (nome, email, senha)
        VALUES (?, ?, ?)
    `;

    const valores = [
        dadosUsuario.nome,
        dadosUsuario.email,
        dadosUsuario.senha
    ];

    const [resultado] = await conexaoBancoDados.execute(comandoSql, valores);

    return {
        idUsuario: resultado.insertId,
        nome: dadosUsuario.nome,
        email: dadosUsuario.email
    };
}

export async function listarUsuarios() {
    const comandoSql = `
        SELECT idUsuario, nome, email
        FROM Usuario
        ORDER BY idUsuario DESC
    `;

    const [linhas] = await conexaoBancoDados.execute(comandoSql);

    return linhas;
}

export async function buscarUsuarioPorId(idUsuario) {
    const comandoSql = `
        SELECT idUsuario, nome, email
        FROM Usuario
        WHERE idUsuario = ?
    `;

    const [linhas] = await conexaoBancoDados.execute(comandoSql, [idUsuario]);

    if (linhas.length === 0) {
        return null;
    }

    return linhas[0];
}

export async function atualizarUsuario(idUsuario, dadosUsuario) {
    const comandoSql = `
        UPDATE Usuario
        SET nome = ?, email = ?, senha = ?
        WHERE idUsuario = ?
    `;

    const valores = [
        dadosUsuario.nome,
        dadosUsuario.email,
        dadosUsuario.senha,
        idUsuario
    ];

    const [resultado] = await conexaoBancoDados.execute(comandoSql, valores);

    return resultado.affectedRows > 0;
}

export async function deletarUsuario(idUsuario) {
    const comandoSql = `
        DELETE FROM Usuario
        WHERE idUsuario = ?
    `;

    const [resultado] = await conexaoBancoDados.execute(comandoSql, [idUsuario]);

    return resultado.affectedRows > 0;
}
