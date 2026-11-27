# JequiTech — enviar códigos pelo Brevo

A integração de e-mail usa a API HTTP transacional do Brevo, sem instalar bibliotecas extras. O frontend, o MySQL, as rotas e o login não foram alterados.

## Configurar uma vez

1. No Brevo, conclua a verificação da conta/telefone e cadastre um remetente em **Configurações → Remetentes, domínio, IPs**. O remetente precisa estar verificado e habilitado para envios. Um domínio próprio autenticado é recomendado para entrega confiável; um endereço Gmail pode ter restrições de autenticação/entrega.
2. Em **SMTP & API → Chaves API**, crie uma chave com permissão de envio transacional. Guarde a chave em segredo. Verifique também as regras de autorização de IP no painel do Brevo.
3. **Mantenha seu arquivo `.env` antigo** na pasta `jequitech-api`, preservando todas as configurações do banco e de autenticação. Remova as configurações antigas `RESEND_API_KEY` e `EMAIL_FROM` para evitar confusão; elas não são mais utilizadas.
4. Adicione ao `.env` (sem `#`):

```env
BREVO_API_KEY=COLE_SUA_CHAVE_BREVO_AQUI
BREVO_SENDER_EMAIL=seu-remetente-verificado@exemplo.com
BREVO_SENDER_NAME=JequiTech
```

Troque os valores pelos da **sua própria conta**. `BREVO_SENDER_EMAIL` é o endereço de **quem envia**, não o destinatário. Não inclua `< >` nesse campo. Nunca compartilhe seu `.env` ou sua chave.

## Iniciar e testar

1. Ligue o MySQL no XAMPP.
2. Abra CMD dentro da pasta `jequitech-api`. Nesta cópia nova execute `npm install` uma vez e depois `npm start`.
3. No JequiTech, solicite a recuperação de senha para um e-mail **já cadastrado na tabela `usuarios`**. A API mantém uma resposta genérica mesmo quando o endereço não existe, por segurança.
4. Verifique o terminal da API (sem compartilhar dados sensíveis) e o painel de e-mails transacionais do Brevo. A mensagem "Brevo aceitou" não garante que chegou à caixa de entrada; confira status e spam.
5. Se aparecer erro HTTP 401/403, confira a chave, o estado da conta e a autorização de IP. Se aparecer erro sobre remetente, confira o e-mail verificado no Brevo.

## Modo desenvolvimento

Se `BREVO_API_KEY` não estiver configurada, o código aparece somente no terminal da API, **não é enviado por e-mail**. Use apenas para desenvolvimento local.

## Segurança

Chaves expostas em capturas de tela devem ser revogadas e substituídas. Prefira uma chave de acesso restrito ao envio transacional. Não publique o `.env`.
