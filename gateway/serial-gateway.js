// serial-gateway.js

import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const caminhoPortaSerial = process.env.PORTA_SERIAL || 'COM3';
const velocidadeSerial = Number(process.env.VELOCIDADE_SERIAL || 9600);

const urlBackend = process.env.URL_BACKEND || 'http://localhost:3000/api/leituras';

const portaSerial = new SerialPort({
  path: caminhoPortaSerial,
  baudRate: velocidadeSerial
});

const leitorLinha = portaSerial.pipe(
  new ReadlineParser({ delimiter: '\n' })
);

function validarDadosSensor(dados) {
  if (typeof dados !== 'object' || dados === null) {
    return false;
  }

  if (typeof dados.dispositivo !== 'string') {
    return false;
  }

  if (typeof dados.numeroLeitura !== 'number') {
    return false;
  }

  if (!Number.isFinite(dados.temperatura)) {
    return false;
}

if (!Number.isFinite(dados.umidade)) {
    return false;
}

if (!Number.isFinite(dados.luminosidadeLux)) {
    return false;
}

if (!Number.isFinite(dados.tempoMillis)) {
    return false;
}

  return true;
}

async function enviarParaBackend(dadosSensor) {

  try {

    const resposta = await fetch(urlBackend, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dadosSensor)
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    return await resposta.json();

  } catch (erro) {

    console.error("Erro ao conectar ao backend:", erro.message);

    return null;

  }

}

portaSerial.on('open', () => {
  console.log(`Porta serial aberta em ${caminhoPortaSerial} com velocidade ${velocidadeSerial}.`);
});

portaSerial.on('error', (erro) => {
  console.error('Erro na porta serial:', erro.message);
});

leitorLinha.on('data', async (linhaRecebida) => {
  const linha = linhaRecebida.trim();

  if (!linha) {
    return;
  }

  console.log('Linha recebida do Arduino:', linha);

  try {
    const dadosSensor = JSON.parse(linha);

    if (dadosSensor.tipo === 'status') {
    console.log(dadosSensor.mensagem);
    return;
  }

    if (dadosSensor.erro) {
    console.warn('Arduino informou erro:', dadosSensor.erro);
    return;
  }

    if (!validarDadosSensor(dadosSensor)) {
      console.warn('JSON recebido, mas inválido para o formato esperado:', dadosSensor);
      return;
    }

    console.log('JSON validado com sucesso:', dadosSensor);

    const respostaBackend = await enviarParaBackend(dadosSensor);

if (respostaBackend) {

    console.log(
        "Dados enviados ao backend com sucesso:",
        respostaBackend
    );

};

  } catch (erro) {
    console.error('Falha ao processar linha recebida:', erro.message);
  }
});