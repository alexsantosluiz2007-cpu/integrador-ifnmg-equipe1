import {
    criarAlerta,
    listarAlertas,
    buscarAlertaPorId,
    deletarAlerta
} from '../models/alerta.model.js';

function validarDadosAlerta(dadosAlerta) {
    if (!dadosAlerta.tipo) {
        return false;
    }

    if (!dadosAlerta.idSensor) {
        return false;
    }

    return true;
}

export async function cadastrarAlerta(req, res) {
    try {
        const dadosAlerta = req.body;

        if (!validarDadosAlerta(dadosAlerta)) {
            return res.status(400).json({
                mensagem: 'Tipo do alerta e idSensor são obrigatórios.'
            });
        }

        const alertaCriado = await criarAlerta(dadosAlerta);

        return res.status(201).json({
            mensagem: 'Alerta cadastrado com sucesso.',
            dados: alertaCriado
        });

    } catch (erro) {
        console.error('Erro ao cadastrar alerta:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao cadastrar alerta.'
        });
    }
}

export async function buscarAlertas(req, res) {
    try {
        const alertas = await listarAlertas();

        return res.status(200).json({
            mensagem: 'Alertas listados com sucesso.',
            total: alertas.length,
            dados: alertas
        });

    } catch (erro) {
        console.error('Erro ao listar alertas:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao listar alertas.'
        });
    }
}

export async function buscarAlerta(req, res) {
    try {
        const { id } = req.params;

        const alerta = await buscarAlertaPorId(id);

        if (!alerta) {
            return res.status(404).json({
                mensagem: 'Alerta não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Alerta encontrado com sucesso.',
            dados: alerta
        });

    } catch (erro) {
        console.error('Erro ao buscar alerta:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao buscar alerta.'
        });
    }
}

export async function removerAlerta(req, res) {
    try {
        const { id } = req.params;

        const removido = await deletarAlerta(id);

        if (!removido) {
            return res.status(404).json({
                mensagem: 'Alerta não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Alerta removido com sucesso.'
        });

    } catch (erro) {
        console.error('Erro ao remover alerta:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao remover alerta.'
        });
    }
}
