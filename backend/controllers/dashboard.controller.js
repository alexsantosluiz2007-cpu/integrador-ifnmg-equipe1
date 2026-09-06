import { buscarDadosDashboard } from '../models/dashboard.model.js';

export async function buscarDashboard(req, res) {
    try {
        const dadosDashboard = await buscarDadosDashboard();

        if (!dadosDashboard) {
            return res.status(200).json({
                mensagem: 'Nenhuma leitura encontrada.',
                dados: null
            });
        }

        return res.status(200).json({
            mensagem: 'Dados do dashboard consultados com sucesso.',
            dados: dadosDashboard
        });

    } catch (erro) {
        console.error('Erro ao buscar dados do dashboard:', erro.message);

        return res.status(500).json({
            mensagem: 'Erro interno ao buscar dados do dashboard.'
        });
    }
}
