import express from 'express';

import {
    buscarDashboard
} from '../controllers/dashboard.controller.js';

const rotasDashboard = express.Router();

rotasDashboard.get('/', buscarDashboard);

export default rotasDashboard;
