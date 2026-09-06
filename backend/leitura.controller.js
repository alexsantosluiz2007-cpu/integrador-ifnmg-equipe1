import {
    salvarLeitura,
    listarLeituras,
    buscarUltimaLeitura
} from '../models/leitura.model.js';

function validarDadosLeitura(dados) {
    if (typeof dados !== 'object' || dados === null) {
        return false;
    }

    if (typeof dados.dispositivo !== 'string') {
        return false;
    }

    if (typeof dados.numeroLeitura !== 'number') {
        return false;
    }

    if (typeof dados.temperatura !== 'number') {
        return false;
    }

    if (typeof dados.umidade !== 'number') {
        return false;
    }

    if (typeof dados.luminosidadeLux !== 'number') {
        return false;
    }

    if (typeof dados.tempoMillis !== 'number') {
        return false;
    }

    return true;
}

export async function cadastrarLeitura(req, res) {
    try {
        const dadosLeitura = req.body;

        if (!validarDadosLeitura(dadosLeitura)) {
            return res.status(400).json({
                mensagem: 'Dados inválidos. Verifique o formato enviado pelo gateway.'
            });
        }

        const leituraSalva = await salvarLeitura(dadosLeitura);

        return res.status(201).json({
            mensagem: 'Leitura salva com sucesso.',
            dados: leituraSalva
        });

    } catch (erro) {

    console.error("Erro ao salvar leitura:", erro.message);

    return res.status(500).json({
        mensagem: "Erro interno ao salvar leitura."
    });

}
}

export async function buscarLeituras(req, res) {
    try {
        const leituras = await listarLeituras();

        return res.status(200).json({
            mensagem: 'Leituras listadas com sucesso.',
            total: leituras.length,
            dados: leituras
        });

    } catch (erro) {
        console.error('Erro ao listar leituras:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao listar leituras.'
        });
    }
}

export async function buscarUltima(req, res) {
    try {
        const ultimaLeitura = await buscarUltimaLeitura();

        return res.status(200).json({
            mensagem: 'Última leitura consultada com sucesso.',
            dados: ultimaLeitura
        });

    } catch (erro) {
        console.error('Erro ao buscar última leitura:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao buscar última leitura.'
        });
    }
}