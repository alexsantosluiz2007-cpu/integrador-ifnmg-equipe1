import {
    criarSensor,
    listarSensores,
    buscarSensorPorId,
    atualizarSensor,
    deletarSensor
} from '../models/sensor.model.js';

function validarDadosSensor(dadosSensor) {
    if (!dadosSensor.tipo) {
        return false;
    }

    if (!dadosSensor.status) {
        return false;
    }

    if (!dadosSensor.idSala) {
        return false;
    }

    return true;
}

export async function cadastrarSensor(req, res) {
    try {
        const dadosSensor = req.body;

        if (!validarDadosSensor(dadosSensor)) {
            return res.status(400).json({
                mensagem: 'Tipo, status e idSala são obrigatórios.'
            });
        }

        const sensorCriado = await criarSensor(dadosSensor);

        return res.status(201).json({
            mensagem: 'Sensor cadastrado com sucesso.',
            dados: sensorCriado
        });

    } catch (erro) {
        console.error('Erro ao cadastrar sensor:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao cadastrar sensor.'
        });
    }
}

export async function buscarSensores(req, res) {
    try {
        const sensores = await listarSensores();

        return res.status(200).json({
            mensagem: 'Sensores listados com sucesso.',
            total: sensores.length,
            dados: sensores
        });

    } catch (erro) {
        console.error('Erro ao listar sensores:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao listar sensores.'
        });
    }
}

export async function buscarSensor(req, res) {
    try {
        const { id } = req.params;

        const sensor = await buscarSensorPorId(id);

        if (!sensor) {
            return res.status(404).json({
                mensagem: 'Sensor não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Sensor encontrado com sucesso.',
            dados: sensor
        });

    } catch (erro) {
        console.error('Erro ao buscar sensor:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao buscar sensor.'
        });
    }
}

export async function editarSensor(req, res) {
    try {
        const { id } = req.params;
        const dadosSensor = req.body;

        if (!validarDadosSensor(dadosSensor)) {
            return res.status(400).json({
                mensagem: 'Tipo, status e idSala são obrigatórios.'
            });
        }

        const atualizado = await atualizarSensor(id, dadosSensor);

        if (!atualizado) {
            return res.status(404).json({
                mensagem: 'Sensor não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Sensor atualizado com sucesso.'
        });

    } catch (erro) {
        console.error('Erro ao atualizar sensor:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao atualizar sensor.'
        });
    }
}

export async function removerSensor(req, res) {
    try {
        const { id } = req.params;

        const removido = await deletarSensor(id);

        if (!removido) {
            return res.status(404).json({
                mensagem: 'Sensor não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Sensor removido com sucesso.'
        });

    } catch (erro) {
        console.error('Erro ao remover sensor:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao remover sensor.'
        });
    }
}
