import express from 'express';

import {
    cadastrarAlerta,
    buscarAlertas,
    buscarAlerta,
    removerAlerta
} from '../controllers/alerta.controller.js';

const rotasAlerta = express.Router();

rotasAlerta.post('/', cadastrarAlerta);

rotasAlerta.get('/', buscarAlertas);

rotasAlerta.get('/:id', buscarAlerta);

rotasAlerta.delete('/:id', removerAlerta);

export default rotasAlerta;