#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>

#define DHTPIN 2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);
BH1750 lightMeter;

const unsigned long intervaloEnvio = 2000;
unsigned long ultimoEnvio = 0;

unsigned long contadorLeitura = 0;

void setup() {
  Serial.begin(9600);

  dht.begin();

  Wire.begin();

  if (!lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("{\"erro\":\"BH1750 não encontrado\"}");
    while (true);
  }

  Serial.println("{\"tipo\":\"status\",\"mensagem\":\"Arduino iniciado com DHT22 e BH1750\"}");
}

void loop() {
  unsigned long tempoAtual = millis();

  if (tempoAtual - ultimoEnvio >= intervaloEnvio) {
    ultimoEnvio = tempoAtual;

    float temperatura = dht.readTemperature();
    float umidade = dht.readHumidity();
    float luminosidade = lightMeter.readLightLevel();

    if (luminosidade < 0) {
      Serial.println("{\"erro\":\"Falha ao ler BH1750\"}");
      return;
    }

    if (isnan(temperatura) || isnan(umidade)) {
      Serial.println("{\"erro\":\"Falha ao ler DHT22\"}");
      return;
    }

    contadorLeitura++;

    String json = "{";
    json += "\"dispositivo\":\"arduino-uno-01\",";
    json += "\"numeroLeitura\":" + String(contadorLeitura) + ",";
    json += "\"temperatura\":" + String(temperatura, 1) + ",";
    json += "\"umidade\":" + String(umidade, 1) + ",";
    json += "\"luminosidadeLux\":" + String(luminosidade, 1) + ",";
    json += "\"tempoMillis\":" + String(tempoAtual);
    json += "}";

    Serial.println(json);
  }
}

