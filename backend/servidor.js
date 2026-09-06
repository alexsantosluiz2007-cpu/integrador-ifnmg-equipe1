import app from './app.js';

const porta = process.env.PORTA || 3000;

app.listen(porta, '0.0.0.0', () => {
    console.log(`API executando em http://localhost:${porta}`);
});