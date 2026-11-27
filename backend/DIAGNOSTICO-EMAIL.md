# Diagnóstico do e-mail JequiTech

1. Mantenha o arquivo `.env` da instalação atual. Ele não está incluído no ZIP.
2. Ligue o MySQL no XAMPP, instale dependências com `npm install` nesta nova pasta e rode `npm start`.
3. Solicite o código usando um e-mail que esteja cadastrado na tabela `usuarios` do banco `jequitech`. Para o remetente `onboarding@resend.dev`, o destinatário também deve ser o e-mail autorizado da conta Resend.
4. Observe o terminal: `[EMAIL] Recuperação solicitada para endereço não cadastrado` significa que a API não encontrou esse endereço na tabela `usuarios`; `[EMAIL] Resend recusou` significa que o serviço rejeitou a solicitação; `[EMAIL] Solicitação de envio aceita` significa que o Resend aceitou e é necessário conferir a entrega no painel.
5. A resposta do site permanece genérica por segurança e não confirma entrega.

O único ajuste de lógica é a mensagem de diagnóstico no servidor quando o e-mail não existe no banco. Não altera rotas, consultas, cadastros, sensores nem a resposta pública. Não exponha sua chave Resend.
