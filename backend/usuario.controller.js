import {
    criarUsuario,
    listarUsuarios,
    buscarUsuarioPorId,
    atualizarUsuario,
    deletarUsuario
} from '../models/usuario.model.js';

export async function cadastrarUsuario(req, res) {
    try {
        const dadosUsuario = req.body;

        if (!dadosUsuario.nome || !dadosUsuario.email || !dadosUsuario.senha) {
            return res.status(400).json({
                mensagem: 'Nome, email e senha são obrigatórios.'
            });
        }

        const usuarioCriado = await criarUsuario(dadosUsuario);

        return res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso.',
            dados: usuarioCriado
        });

    } catch (erro) {
        console.error('Erro ao cadastrar usuário:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao cadastrar usuário.'
        });
    }
}

export async function buscarUsuarios(req, res) {
    try {
        const usuarios = await listarUsuarios();

        return res.status(200).json({
            mensagem: 'Usuários listados com sucesso.',
            total: usuarios.length,
            dados: usuarios
        });

    } catch (erro) {
        console.error('Erro ao listar usuários:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao listar usuários.'
        });
    }
}

export async function buscarUsuario(req, res) {
    try {
        const { id } = req.params;

        const usuario = await buscarUsuarioPorId(id);

        if (!usuario) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Usuário encontrado com sucesso.',
            dados: usuario
        });

    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao buscar usuário.'
        });
    }
}

export async function editarUsuario(req, res) {
    try {
        const { id } = req.params;
        const dadosUsuario = req.body;

        if (!dadosUsuario.nome || !dadosUsuario.email || !dadosUsuario.senha) {
            return res.status(400).json({
                mensagem: 'Nome, email e senha são obrigatórios.'
            });
        }

        const atualizado = await atualizarUsuario(id, dadosUsuario);

        if (!atualizado) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Usuário atualizado com sucesso.'
        });

    } catch (erro) {
        console.error('Erro ao atualizar usuário:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao atualizar usuário.'
        });
    }
}

export async function removerUsuario(req, res) {
    try {
        const { id } = req.params;

        const removido = await deletarUsuario(id);

        if (!removido) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Usuário removido com sucesso.'
        });

    } catch (erro) {
        console.error('Erro ao remover usuário:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao remover usuário.'
        });
    }
}