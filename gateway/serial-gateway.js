import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from 'node:process';

// O .env fica na mesma pasta deste arquivo. Variáveis do sistema têm prioridade.
try { loadEnvFile(fileURLToPath(new URL('./.env', import.meta.url))); }
catch (erro) { if (erro.code !== 'ENOENT') throw erro; }

const caminhoPortaSerial = process.env.PORTA_SERIAL || 'COM3';
const velocidadeSerial = Number(process.env.VELOCIDADE_SERIAL || 9600);
const urlBackend = process.env.URL_BACKEND || 'http://localhost:3000/api/leituras';
const chaveDispositivo = process.env.DEVICE_API_KEY;
if (!chaveDispositivo?.trim()) {
  console.error('Configure DEVICE_API_KEY no .env com a mesma chave da API.');
  process.exit(1);
}
if (!Number.isInteger(velocidadeSerial) || velocidadeSerial <= 0) throw new Error('VELOCIDADE_SERIAL inválida.');

const limites = { temperatura: [-40, 125], umidade: [0, 100], luminosidade: [0, 200000] };
function prepararLeitura(dados) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return null;
  const leitura = {};
  const campos = { temperatura: dados.temperatura, umidade: dados.umidade, luminosidade: dados.luminosidadeLux ?? dados.luminosidade };
  for (const [sensor, bruto] of Object.entries(campos)) {
    if (bruto == null || (typeof bruto === 'string' && !bruto.trim())) continue;
    const valor = typeof bruto === 'number' || typeof bruto === 'string' ? Number(bruto) : NaN;
    const [min, max] = limites[sensor];
    if (!Number.isFinite(valor) || valor < min || valor > max) {
      console.warn(`Sensor ${sensor}: valor inválido, ignorado.`);
      continue;
    }
    leitura[sensor] = valor;
  }
  if (!Object.keys(leitura).length) return null;
  // Sem usuario, a API usa DEVICE_USER ou o primeiro administrador.
  const usuario = process.env.DEVICE_USER || dados.usuario;
  if (typeof usuario === 'string' && usuario.trim()) leitura.usuario = usuario.trim();
  return leitura;
}

async function enviarParaBackend(leitura) {
  try {
    const resposta = await fetch(urlBackend, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': chaveDispositivo },
      body: JSON.stringify(leitura),
      signal: AbortSignal.timeout(5000)
    });
    const corpo = await resposta.text();
    if (!resposta.ok) {
      console.error(`API HTTP ${resposta.status}: ${corpo}`);
      if (resposta.status === 401) console.error('Confira DEVICE_API_KEY na API e no gateway.');
      if (resposta.status === 409) console.error('Cadastre um usuário para receber as leituras.');
      return;
    }
    console.log('Leitura enviada com sucesso:', corpo);
  } catch (erro) {
    console.error('Falha no envio à API:', erro.message, '- leitura não armazenada pelo gateway.');
  }
}

const portaSerial = new SerialPort({ path: caminhoPortaSerial, baudRate: velocidadeSerial });
const leitorLinha = portaSerial.pipe(new ReadlineParser({ delimiter: '\n' }));
portaSerial.on('open', () => console.log(`Serial aberta: ${caminhoPortaSerial} (${velocidadeSerial} baud).`));
portaSerial.on('error', erro => console.error('Erro serial:', erro.message));
portaSerial.on('close', () => console.warn('Porta serial fechada. Confira a conexão e reinicie o gateway.'));
leitorLinha.on('error', erro => console.error('Erro no leitor serial:', erro.message));

leitorLinha.on('data', async linhaRecebida => {
  const linha = linhaRecebida.trim();
  if (!linha) return;
  try {
    const dados = JSON.parse(linha);
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return;
    if (dados.tipo === 'status') { console.log('Arduino:', dados.mensagem); return; }
    if (dados.erro) console.warn('Arduino informou erro:', dados.erro);
    const leitura = prepararLeitura(dados);
    if (!leitura) { console.warn('Nenhuma leitura válida recebida.'); return; }
    console.log('Leitura validada:', leitura);
    await enviarParaBackend(leitura);
  } catch (erro) { console.error('Falha ao processar linha serial:', erro.message); }
});
