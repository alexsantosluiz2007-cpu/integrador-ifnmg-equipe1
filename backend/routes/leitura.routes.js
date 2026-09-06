import express from 'express';

import {
    cadastrarLeitura,
    buscarLeituras,
    buscarUltima
} from '../controllers/leitura.controller.js';

const rotasLeitura = express.Router();

rotasLeitura.post('/', cadastrarLeitura);

rotasLeitura.get('/', buscarLeituras);

rotasLeitura.get('/ultima', buscarUltima);

export default rotasLeitura;
