import {
    criarSala,
    listarSalas,
    buscarSalaPorId,
    atualizarSala,
    deletarSala
} from '../models/sala.model.js';

function validarDadosSala(dadosSala) {
    if (!dadosSala.nome) {
        return false;
    }

    if (!dadosSala.idUsuario) {
        return false;
    }

    return true;
}

export async function cadastrarSala(req, res) {
    try {
        const dadosSala = req.body;

        if (!validarDadosSala(dadosSala)) {
            return res.status(400).json({
                mensagem: 'Nome da sala e idUsuario são obrigatórios.'
            });
        }

        const salaCriada = await criarSala(dadosSala);

        return res.status(201).json({
            mensagem: 'Sala cadastrada com sucesso.',
            dados: salaCriada
        });

    } catch (erro) {
        console.error('Erro ao cadastrar sala:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao cadastrar sala.'
        });
    }
}

export async function buscarSalas(req, res) {
    try {
        const salas = await listarSalas();

        return res.status(200).json({
            mensagem: 'Salas listadas com sucesso.',
            total: salas.length,
            dados: salas
        });

    } catch (erro) {
        console.error('Erro ao listar salas:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao listar salas.'
        });
    }
}

export async function buscarSala(req, res) {
    try {
        const { id } = req.params;

        const sala = await buscarSalaPorId(id);

        if (!sala) {
            return res.status(404).json({
                mensagem: 'Sala não encontrada.'
            });
        }

        return res.status(200).json({
            mensagem: 'Sala encontrada com sucesso.',
            dados: sala
        });

    } catch (erro) {
        console.error('Erro ao buscar sala:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao buscar sala.'
        });
    }
}

export async function editarSala(req, res) {
    try {
        const { id } = req.params;
        const dadosSala = req.body;

        if (!validarDadosSala(dadosSala)) {
            return res.status(400).json({
                mensagem: 'Nome da sala e idUsuario são obrigatórios.'
            });
        }

        const atualizada = await atualizarSala(id, dadosSala);

        if (!atualizada) {
            return res.status(404).json({
                mensagem: 'Sala não encontrada.'
            });
        }

        return res.status(200).json({
            mensagem: 'Sala atualizada com sucesso.'
        });

    } catch (erro) {
        console.error('Erro ao atualizar sala:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao atualizar sala.'
        });
    }
}

export async function removerSala(req, res) {
    try {
        const { id } = req.params;

        const removida = await deletarSala(id);

        if (!removida) {
            return res.status(404).json({
                mensagem: 'Sala não encontrada.'
            });
        }

        return res.status(200).json({
            mensagem: 'Sala removida com sucesso.'
        });

    } catch (erro) {
        console.error('Erro ao remover sala:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao remover sala.'
        });
    }
}