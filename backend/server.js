'use strict';
// Ponto de entrada: confere a conexão com o banco (que já deve existir), sobe o servidor e fecha tudo com cuidado ao encerrar.
const config = require('./src/config');
const { conectar, fechar } = require('./src/database/db');
const { criarServidor } = require('./src/app');

let server;
let encerrando = false;

async function encerrar(motivo, codigo = 0) {
  if (encerrando) return;
  encerrando = true;
  console.log(`Encerrando (${motivo})...`);
  // Força a saída após 5 s caso alguma conexão não termine
  setTimeout(() => process.exit(codigo), 5000).unref();
  // Para de aceitar conexões novas, deixa as em andamento terminarem e depois fecha o banco
  if (server) await new Promise((ok) => server.close(ok));
  try { await fechar(); } catch (e) { console.error('Falha ao fechar o banco:', e.message); codigo = 1; }
  process.exit(codigo);
}

// Traduz os erros mais comuns de conexão em uma dica do que fazer (o erro original continua sendo mostrado)
function dicaDoErro(e) {
  const d = config.db;
  switch (e.code) {
    case 'MODULE_NOT_FOUND': return 'Faltou instalar as dependências: rode "npm install" na pasta do projeto.';
    case 'ECONNREFUSED': return `O MySQL não respondeu em ${d.host}:${d.port}. Abra o XAMPP e clique em "Start" no MySQL (confira também DB_PORT).`;
    case 'ETIMEDOUT':
    case 'ENOTFOUND': return `Não foi possível alcançar o servidor do banco (${d.host}:${d.port}). Confira DB_HOST e DB_PORT no .env.`;
    case 'ER_ACCESS_DENIED_ERROR': return `Usuário ou senha do banco recusados (DB_USER="${d.user}"). No XAMPP o padrão é usuário root e senha vazia.`;
    case 'ER_BAD_DB_ERROR': return `O banco "${d.database}" não existe. Importe o arquivo jequitech-banco.sql no phpMyAdmin (aba "Importar") ou confira DB_NAME no .env.`;
    case 'ER_NO_SUCH_TABLE': return `O banco "${d.database}" existe, mas faltam tabelas. Importe o arquivo jequitech-banco.sql no phpMyAdmin (aba "Importar").`;
    default: return 'Confira o .env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).';
  }
}

async function iniciar() {
  try {
    await conectar(); // só confere a conexão e se as tabelas existem (a API não cria o banco)
  } catch (e) {
    console.error(`Não foi possível conectar ao banco (${config.db.user}@${config.db.host}:${config.db.port}/${config.db.database}): ${e.message}`);
    console.error(dicaDoErro(e));
    process.exit(1);
  }
  server = criarServidor();
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') console.error(`A porta ${config.port} já está em uso. Feche a outra API que estiver rodando (ou mude PORT no .env) e tente de novo.`);
    else console.error('Erro no servidor:', e.message);
    encerrar('erro ao iniciar o servidor', 1);
  });
  server.listen(config.port, () => {
    console.log(`JequiTech API rodando em http://localhost:${config.port}/api (banco: ${config.db.database}@${config.db.host})`);
    if (!config.jwtDefinido) console.warn('AVISO: JWT_SECRET não definido; usando segredo temporário (as sessões caem ao reiniciar).');
    if (!config.deviceKeyDefinida) console.warn(`AVISO: DEVICE_API_KEY não definida. Chave temporária do Arduino: ${config.deviceKey}`);
  });
}

process.on('SIGINT', () => encerrar('SIGINT'));
process.on('SIGTERM', () => encerrar('SIGTERM'));
// Com o banco em MySQL nada fica pendente em memória, então um erro inesperado só precisa ser registrado antes de sair
process.on('uncaughtException', (e) => { console.error('Exceção não tratada:', e); encerrar('uncaughtException', 1); });
process.on('unhandledRejection', (e) => { console.error('Promise rejeitada sem tratamento:', e); encerrar('unhandledRejection', 1); });

iniciar();
