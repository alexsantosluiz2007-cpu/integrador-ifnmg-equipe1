import mysql from 'mysql2/promise';

export const conexaoBancoDados = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'monitoramento_ambiental',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});