// =====================================================
// SESSÃO E CHAMADAS AUTENTICADAS (telas do painel)
// Carregue DEPOIS de ../config.js e ANTES dos demais scripts da tela.
// =====================================================

// Sem token: volta para o login antes de a tela mostrar qualquer coisa
if (!localStorage.getItem("token")) {
    location.replace("../index.html");
}

function encerrarSessao(aviso) {
    ["token", "usuarioLogado", "ultimaLeituraSensores"].forEach(k => localStorage.removeItem(k));
    if (aviso) sessionStorage.setItem("aviso", aviso);
    location.replace("../index.html");
}

// fetch para a API já com o token. Se a API responder 401 (sessão expirada
// ou inválida), encerra a sessão e leva o usuário de volta ao login.
async function apiFetch(caminho, opcoes = {}) {
    const headers = {
        ...(opcoes.headers || {}),
        "Authorization": "Bearer " + (localStorage.getItem("token") || "")
    };
    const resposta = await fetch(apiUrl(caminho), { ...opcoes, headers });
    if (resposta.status === 401) {
        encerrarSessao("Sua sessão expirou. Entre novamente.");
        throw new Error("Sessão expirada.");
    }
    return resposta;
}

// Mostra só o primeiro nome de quem está logado onde houver id="nomeUsuario"
// (ex.: "João Marcos de Souza Carvalho" -> "João")
function primeiroNome(nomeCompleto) {
    const primeiro = String(nomeCompleto || "").trim().split(/\s+/)[0] || "";
    return primeiro.charAt(0).toUpperCase() + primeiro.slice(1);
}

document.addEventListener("DOMContentLoaded", () => {
    let usuario = {};
    try { usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || {}; } catch (e) { }
    const nome = primeiroNome(usuario.nome);
    document.querySelectorAll("#nomeUsuario").forEach(el => { if (nome) el.textContent = nome; });
});
