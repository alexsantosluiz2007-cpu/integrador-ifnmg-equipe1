-- =====================================================================================================
-- JequiTech: banco de dados (MySQL 5.7+ / MariaDB 10.3+)
-- Cria o banco "jequitech" e as tabelas originais: usuarios, leituras, sensor_atual, alertas, reset_senha.
--
-- Como importar:
--   * phpMyAdmin: aba "Importar" > escolha este arquivo > "Importar"
--   * terminal:   mysql -u root -p < jequitech-banco.sql
--
-- Pode ser importado mais de uma vez sem problema (não apaga dados; pare a API e o gateway antes de importar).
-- A API não cria o banco: importe este arquivo ANTES de iniciar a API.
-- Se mudar o nome do banco aqui, mude também DB_NAME no .env da API.
-- =====================================================================================================

CREATE DATABASE IF NOT EXISTS jequitech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jequitech;

CREATE TABLE IF NOT EXISTS usuarios (
  id            CHAR(36)     NOT NULL PRIMARY KEY,           -- UUID
  nome          VARCHAR(100) NOT NULL,
  usuario       VARCHAR(30)  NOT NULL UNIQUE,                -- login (minúsculo)
  email         VARCHAR(120) NOT NULL UNIQUE,
  telefone      VARCHAR(20)  NOT NULL DEFAULT '',
  senha_hash    VARCHAR(255) NOT NULL,                       -- nunca a senha pura
  senha_versao  INT          NOT NULL DEFAULT 0,             -- sobe a cada troca de senha (invalida tokens antigos)
  is_admin      TINYINT(1)   NOT NULL DEFAULT 0,             -- o 1º cadastro vira administrador
  criado_em     DATETIME(3)  NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS leituras (
  id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  usuario       VARCHAR(30)  NOT NULL,                       -- dono da leitura
  momento       DATETIME(3)  NOT NULL,                       -- sempre em UTC
  temperatura   DOUBLE       NULL,                           -- NULL = o Arduino não mandou este sensor
  umidade       DOUBLE       NULL,
  luminosidade  DOUBLE       NULL,
  CONSTRAINT fk_leituras_usuario FOREIGN KEY (usuario) REFERENCES usuarios (usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_leituras_usuario_momento (usuario, momento)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sensor_atual (                    -- último valor de cada sensor, por usuário
  usuario        VARCHAR(30)  NOT NULL,
  sensor         VARCHAR(20)  NOT NULL,                      -- temperatura | umidade | luminosidade
  valor          DOUBLE       NOT NULL,
  atualizado_em  DATETIME(3)  NOT NULL,
  PRIMARY KEY (usuario, sensor),
  CONSTRAINT fk_sensor_usuario FOREIGN KEY (usuario) REFERENCES usuarios (usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alertas (
  seq            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,  -- desempata alertas criados no mesmo instante
  id             CHAR(36)     NOT NULL UNIQUE,                      -- UUID usado na API
  usuario        VARCHAR(30)  NOT NULL,
  sensor         VARCHAR(20)  NOT NULL,
  nivel          VARCHAR(10)  NOT NULL,                             -- atencao | critico
  direcao        VARCHAR(10)  NOT NULL,                             -- alta | baixa
  titulo         VARCHAR(120) NOT NULL,
  detalhes       VARCHAR(255) NOT NULL,
  valor          DOUBLE       NOT NULL,
  status         VARCHAR(10)  NOT NULL DEFAULT 'ativo',             -- ativo | resolvido
  ciencia        VARCHAR(10)  NOT NULL DEFAULT 'pendente',          -- pendente | ciente
  removido       TINYINT(1)   NOT NULL DEFAULT 0,                   -- apagado pelo usuário, mas a condição ainda está ativa
  criado_em      DATETIME(3)  NOT NULL,
  resolvido_em   DATETIME(3)  NULL,
  resolvido_por  VARCHAR(30)  NULL,                                 -- 'automatico' ou o login de quem resolveu
  ciente_em      DATETIME(3)  NULL,
  ciente_por     VARCHAR(30)  NULL,
  CONSTRAINT fk_alertas_usuario FOREIGN KEY (usuario) REFERENCES usuarios (usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_alertas_usuario (usuario, status, sensor, criado_em)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reset_senha (                     -- código de 6 dígitos da recuperação de senha
  email        VARCHAR(120) NOT NULL PRIMARY KEY,
  codigo_hash  VARCHAR(128) NOT NULL,                        -- só o hash do código
  expira_em    DATETIME(3)  NOT NULL,
  tentativas   TINYINT      NOT NULL DEFAULT 0,              -- bloqueia em 5
  enviado_em   DATETIME(3)  NOT NULL
) ENGINE=InnoDB;

-- Atualização: parar API/gateway antes de importar. Dias civis de Brasília (UTC-03).
CREATE TABLE IF NOT EXISTS historico_diario (
  usuario VARCHAR(30) NOT NULL,
  data DATE NOT NULL,
  sensor VARCHAR(20) NOT NULL,
  minimo DOUBLE NOT NULL,
  maximo DOUBLE NOT NULL,
  soma DOUBLE NOT NULL,
  amostras BIGINT NOT NULL,
  ideais BIGINT NOT NULL,
  PRIMARY KEY (usuario, data, sensor),
  CONSTRAINT fk_historico_usuario FOREIGN KEY (usuario) REFERENCES usuarios(usuario) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
INSERT IGNORE INTO historico_diario (usuario, data, sensor, minimo, maximo, soma, amostras, ideais)
SELECT usuario, DATE(DATE_SUB(momento, INTERVAL 3 HOUR)), 'temperatura', MIN(temperatura), MAX(temperatura), SUM(temperatura), COUNT(temperatura), SUM(CASE WHEN temperatura BETWEEN 20 AND 28 THEN 1 ELSE 0 END)
FROM leituras WHERE temperatura IS NOT NULL GROUP BY usuario, DATE(DATE_SUB(momento, INTERVAL 3 HOUR));
INSERT IGNORE INTO historico_diario (usuario, data, sensor, minimo, maximo, soma, amostras, ideais)
SELECT usuario, DATE(DATE_SUB(momento, INTERVAL 3 HOUR)), 'umidade', MIN(umidade), MAX(umidade), SUM(umidade), COUNT(umidade), SUM(CASE WHEN umidade BETWEEN 40 AND 70 THEN 1 ELSE 0 END)
FROM leituras WHERE umidade IS NOT NULL GROUP BY usuario, DATE(DATE_SUB(momento, INTERVAL 3 HOUR));
INSERT IGNORE INTO historico_diario (usuario, data, sensor, minimo, maximo, soma, amostras, ideais)
SELECT usuario, DATE(DATE_SUB(momento, INTERVAL 3 HOUR)), 'luminosidade', MIN(luminosidade), MAX(luminosidade), SUM(luminosidade), COUNT(luminosidade), SUM(CASE WHEN luminosidade BETWEEN 300 AND 800 THEN 1 ELSE 0 END)
FROM leituras WHERE luminosidade IS NOT NULL GROUP BY usuario, DATE(DATE_SUB(momento, INTERVAL 3 HOUR));
DROP TRIGGER IF EXISTS jq_historico_insert;
DELIMITER $$
CREATE TRIGGER jq_historico_insert AFTER INSERT ON leituras FOR EACH ROW
BEGIN
  INSERT INTO historico_diario (usuario, data, sensor, minimo, maximo, soma, amostras, ideais)
  SELECT NEW.usuario, DATE(DATE_SUB(NEW.momento, INTERVAL 3 HOUR)), 'temperatura', NEW.temperatura, NEW.temperatura, NEW.temperatura, 1, CASE WHEN NEW.temperatura BETWEEN 20 AND 28 THEN 1 ELSE 0 END
  FROM DUAL WHERE NEW.temperatura IS NOT NULL
  ON DUPLICATE KEY UPDATE minimo=LEAST(minimo, VALUES(minimo)), maximo=GREATEST(maximo, VALUES(maximo)), soma=soma+VALUES(soma), amostras=amostras+1, ideais=ideais+VALUES(ideais);
  INSERT INTO historico_diario (usuario, data, sensor, minimo, maximo, soma, amostras, ideais)
  SELECT NEW.usuario, DATE(DATE_SUB(NEW.momento, INTERVAL 3 HOUR)), 'umidade', NEW.umidade, NEW.umidade, NEW.umidade, 1, CASE WHEN NEW.umidade BETWEEN 40 AND 70 THEN 1 ELSE 0 END
  FROM DUAL WHERE NEW.umidade IS NOT NULL
  ON DUPLICATE KEY UPDATE minimo=LEAST(minimo, VALUES(minimo)), maximo=GREATEST(maximo, VALUES(maximo)), soma=soma+VALUES(soma), amostras=amostras+1, ideais=ideais+VALUES(ideais);
  INSERT INTO historico_diario (usuario, data, sensor, minimo, maximo, soma, amostras, ideais)
  SELECT NEW.usuario, DATE(DATE_SUB(NEW.momento, INTERVAL 3 HOUR)), 'luminosidade', NEW.luminosidade, NEW.luminosidade, NEW.luminosidade, 1, CASE WHEN NEW.luminosidade BETWEEN 300 AND 800 THEN 1 ELSE 0 END
  FROM DUAL WHERE NEW.luminosidade IS NOT NULL
  ON DUPLICATE KEY UPDATE minimo=LEAST(minimo, VALUES(minimo)), maximo=GREATEST(maximo, VALUES(maximo)), soma=soma+VALUES(soma), amostras=amostras+1, ideais=ideais+VALUES(ideais);
END$$
DELIMITER ;
