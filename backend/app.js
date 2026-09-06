import express from 'express';
import cors from 'cors';

import rotasUsuario from './routes/usuario.routes.js';
import rotasSala from './routes/sala.routes.js';
import rotasSensor from './routes/sensor.routes.js';
import rotasLeitura from './routes/leitura.routes.js';
import rotasAlerta from './routes/alerta.routes.js';
import rotasDashboard from './routes/dashboard.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API Monitoramento Ambiental funcionando!'
    });
});

app.use('/api/usuarios', rotasUsuario);
app.use('/api/salas', rotasSala);
app.use('/api/sensores', rotasSensor);
app.use('/api/leituras', rotasLeitura);
app.use('/api/alertas', rotasAlerta);
app.use('/api/dashboard', rotasDashboard);

export default app;