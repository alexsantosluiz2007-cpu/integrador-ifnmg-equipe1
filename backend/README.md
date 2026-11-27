# JequiTech API

API REST do sistema de monitoramento JequiTech (Arduino Mega 2560 + sensores de temperatura, umidade e luminosidade).
Node.js (18+) com MySQL/MariaDB (driver `mysql2`). O acesso ao banco é assíncrono (`async/await`).

## Como rodar

```bash
cp .env.example .env     # ajuste JWT_SECRET e DEVICE_API_KEY (no Windows: copy .env.example .env)
npm install              # instala o mysql2
# 1) ligue o MySQL (XAMPP > Start)
# 2) importe o jequitech-banco.sql (phpMyAdmin > Importar). A API NÃO cria o banco, só se conecta a ele.
npm start                # ou: npm run dev (reinicia ao salvar)
npm test
```

## Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `PORT` | Porta (padrão 3000) |
| `JWT_SECRET` | Assina os tokens de login. **Obrigatório em produção** (sem ele, as sessões caem a cada reinício) |
| `DEVICE_API_KEY` | Chave que o Arduino envia no header `x-api-key` |
| `CORS_ORIGIN` | Origem permitida. Em produção, use o endereço do site em vez de `*` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexão com o MySQL/MariaDB (padrão: `127.0.0.1:3306`, usuário `root`, senha vazia, banco `jequitech`). `localhost` é tratado como `127.0.0.1` |
| `RATE_LIMIT_OFF` | `true` desliga o limite de tentativas (só para testes manuais) |
| `DEVICE_USER` | Usuário dono das leituras que o Arduino envia **sem** o campo `usuario` (padrão: o primeiro administrador) |
| `TIMEZONE` | Fuso dos campos `data`/`hora` do histórico (padrão `America/Sao_Paulo`) |
| `TRUST_PROXY` | `true` se estiver atrás de Nginx/Render/Railway (usa o IP real no limite de tentativas) |

## Rotas

`GET /api` lista todas as rotas registradas. Resumo:

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/auth/cadastro`, `/login`, `/esqueci-senha`, `/validar-codigo` | público |
| POST | `/api/auth/alterar-senha` | token de reset |
| GET/PUT/DELETE | `/api/perfil`, PUT `/api/perfil/senha` | usuário |
| POST | `/api/leituras` | Arduino (`x-api-key`) |
| GET | `/api/leituras/atual`, `/api/leituras?inicio&fim&limite` | usuário |
| DELETE | `/api/leituras?antes=<ISO>` | admin |
| GET | `/api/historico?inicio&fim&usuario&ordem&limite&offset` | usuário |
| GET | `/api/alertas?ciencia&status&nivel&sensor&usuario&limite&offset` | usuário |
| PUT | `/api/alertas/:id` (`{"ciencia":"ciente"}`, corpo opcional) | dono do alerta / admin |
| PATCH | `/api/alertas/:id/resolver` | dono do alerta / admin |
| DELETE | `/api/alertas/:id` | dono do alerta / admin |
| DELETE | `/api/alertas` (aceita os mesmos filtros) | usuário (limpa os seus) |
| GET | `/api/dispositivo` | usuário |
| GET | `/api/sensores` ou `/api/dispositivos` (`?usuario=nome`) | usuário |
| GET | `/api/usuarios` | admin |
| PATCH | `/api/usuarios/:id/papel` (`{"isAdmin": true\|false}`) | admin |

O primeiro usuário cadastrado vira administrador (`isAdmin: true`).

## Exemplo do Arduino

```
POST /api/leituras
x-api-key: <DEVICE_API_KEY>
{ "temperatura": 25.5, "umidade": 60, "luminosidade": 500, "usuario": "maria" }
```
`usuario` é opcional: informa de quem são os sensores, e o painel filtra com `GET /api/sensores?usuario=maria`.
Envie ao menos um campo; valores fora da faixa física do sensor são rejeitados.

## Estrutura

`routes` → `controllers` (validação de entrada) → `services` (regras) → `models` (acesso aos dados) → `database`.

## Alertas

- Gerados automaticamente a cada leitura que passa dos limites (`src/config/limites.js`) e vinculados ao `usuario` da leitura.
- Dois estados independentes: `ciencia` (`pendente` → `ciente`, quando o operador clica) e `status` (`ativo` enquanto o valor
  segue fora do limite, `resolvido` quando volta ao normal).
- `GET /api/alertas` traz os do usuário logado, com a contagem `pendentes`.
- `DELETE /api/alertas` limpa os do usuário. Se o valor ainda estiver fora do limite, o alerta
  fica escondido até a condição passar, para não reaparecer a cada leitura.

## Isolamento por usuário e administrador

- Toda leitura, alerta e último valor de sensor tem um **dono** (`usuario`). O Arduino informa o dono no campo `usuario` do
  `POST /api/leituras`; sem ele, vale `DEVICE_USER` ou, se vazio, o primeiro administrador.
- `/api/historico`, `/api/leituras`, `/api/leituras/atual`, `/api/sensores`, `/api/dispositivos`, `/api/dispositivo` e `/api/alertas`
  devolvem **só os dados de quem está logado**. `?usuario=outro` só funciona para administradores (senão 403).
  Alertas de outro usuário respondem 404, como se não existissem.
- A conta tem o booleano `isAdmin` (a API também devolve `papel: "admin"|"usuario"` por compatibilidade). Rotas de área
  administrativa usam `rota(..., 'admin', ...)`. Administradores gerenciam permissões em `PATCH /api/usuarios/:id/papel`.
- Ao excluir a conta, os dados do usuário (histórico, alertas, sensores) são apagados junto.


## E-mail do código de redefinição de senha
Defina `RESEND_API_KEY` (e `EMAIL_FROM`) no `.env` para enviar o código por e-mail via Resend. Sem a chave, o código é impresso no console do servidor (modo dev). Falhas de envio vão para o log e não mudam a resposta da API.

## Banco de dados (MySQL/MariaDB)

- O banco é um projeto à parte: o arquivo `jequitech-banco.sql` (fora desta pasta) cria o banco `jequitech` e as 5 tabelas (`usuarios`, `leituras`, `sensor_atual`, `alertas`, `reset_senha`). Importe-o no phpMyAdmin (aba **Importar**) ou com `mysql -u root -p < jequitech-banco.sql` **antes** de iniciar a API. A API não cria nem altera banco/tabelas: ao iniciar, só confere a conexão e se as 5 tabelas existem.
- Se o banco estiver fora do ar, não existir, estiver sem as tabelas ou as credenciais do `.env` estiverem erradas, a API não sobe e mostra o motivo e uma dica do que fazer no console. Se a porta já estiver em uso, também avisa.
- Todo acesso ao banco é assíncrono: ao mexer nos `models`, use `await` em toda chamada (e `async` nas funções que chamam).
- Os testes (`npm test`) usam um banco SQLite em memória no lugar do MySQL e exigem Node 22 ou mais novo.


## Histórico diário (atualização)

Pare API e gateway, faça backup do banco e importe o SQL corrigido antes de iniciar a API. A tabela historico_diario e o trigger jq_historico_insert preservam agregados por usuário, dia civil de Brasília (UTC-03) e sensor. A importação recupera somente leituras ainda existentes e não duplica resumos existentes. A API mantém as rotas anteriores; GET /api/historico/diario?inicio=AAAA-MM-DD&fim=AAAA-MM-DD retorna dias encerrados, com autenticação e escopo existentes. A limpeza de leituras brutas não remove os resumos; a exclusão de conta remove ambos por chave estrangeira. Percentuais representam amostras válidas, não duração medida. Não altere as faixas ideais do trigger sem planejar a migração dos agregados. O .env original foi preservado; não compartilhe publicamente.
