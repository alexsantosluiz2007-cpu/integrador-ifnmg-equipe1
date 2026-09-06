import express from 'express';

import {
    cadastrarSala,
    buscarSalas,
    buscarSala,
    editarSala,
    removerSala
} from '../controllers/sala.controller.js';

const rotasSala = express.Router();

rotasSala.post('/', cadastrarSala);

rotasSala.get('/', buscarSalas);

rotasSala.get('/:id', buscarSala);

rotasSala.put('/:id', editarSala);

rotasSala.delete('/:id', removerSala);

export default rotasSala;