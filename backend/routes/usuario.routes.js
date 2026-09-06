import express from 'express';

import {
    cadastrarUsuario,
    buscarUsuarios,
    buscarUsuario,
    editarUsuario,
    removerUsuario
} from '../controllers/usuario.controller.js';

const rotasUsuario = express.Router();

rotasUsuario.post('/', cadastrarUsuario);

rotasUsuario.get('/', buscarUsuarios);

rotasUsuario.get('/:id', buscarUsuario);

rotasUsuario.put('/:id', editarUsuario);

rotasUsuario.delete('/:id', removerUsuario);

export default rotasUsuario;
