import express from 'express';

import {
    cadastrarSensor,
    buscarSensores,
    buscarSensor,
    editarSensor,
    removerSensor
} from '../controllers/sensor.controller.js';

const rotasSensor = express.Router();

rotasSensor.post('/', cadastrarSensor);

rotasSensor.get('/', buscarSensores);

rotasSensor.get('/:id', buscarSensor);

rotasSensor.put('/:id', editarSensor);

rotasSensor.delete('/:id', removerSensor);

export default rotasSensor;
