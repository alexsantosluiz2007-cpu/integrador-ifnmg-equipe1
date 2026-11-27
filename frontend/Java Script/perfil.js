// ===================================
// RELÓGIO DIGITAL
// ===================================
function atualizarRelogio() {
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, "0");
    const minutos = String(agora.getMinutes()).padStart(2, "0");
    const segundos = String(agora.getSeconds()).padStart(2, "0");

    const relogioEl = document.getElementById("relogio");
    if (relogioEl) {
        relogioEl.textContent = `${horas}:${minutos}:${segundos}`;
    }
}
atualizarRelogio();
setInterval(atualizarRelogio, 1000);

// ===================================
// GERENCIAMENTO DE DADOS DO PERFIL
// ===================================
document.addEventListener("DOMContentLoaded", () => {
    // Referência aos campos restantes
    const inputs = {
        nomeCompleto: document.getElementById("nomeCompleto"),
        telefone: document.getElementById("telefone"),
        usuario: document.getElementById("usuario"),
        email: document.getElementById("email")
    };

    const btnEditar = document.getElementById("btnEditar");
    const btnIcon = document.getElementById("btnIconEditar");
    const btnText = document.getElementById("btnTextEditar");
    const btnSair = document.getElementById("btnSair");

    let emModoEdicao = false;

    // 1. Carregar Dados do Usuário
    function carregarDadosUsuario() {
        const usuarioSalvo = JSON.parse(localStorage.getItem("usuarioLogado")) || {
            nomeCompleto: "nome do usuário",
            usuario: "Usuario_21",
            email: "usuario@gmail.com.br",
            telefone: "(33) 99999-0000"
        };

        inputs.nomeCompleto.value = usuarioSalvo.nomeCompleto || usuarioSalvo.nome || "";
        inputs.telefone.value = usuarioSalvo.telefone || "";
        inputs.usuario.value = usuarioSalvo.usuario || "";
        inputs.email.value = usuarioSalvo.email || "";
    }

    // Confirma os dados com a API (Endpoint: GET /api/perfil) e atualiza a tela
    async function atualizarPerfilDaApi() {
        try {
            const r = await apiFetch("/api/perfil");
            if (!r.ok) return;
            const doServidor = await r.json();
            const atual = JSON.parse(localStorage.getItem("usuarioLogado")) || {};
            localStorage.setItem("usuarioLogado", JSON.stringify({ ...atual, ...doServidor }));
            if (!emModoEdicao) carregarDadosUsuario();
        } catch (e) { /* mantém os dados guardados */ }
    }

    // 2. Ativar / Desativar edição dos campos
    function alternarCampos(habilitar) {
        Object.values(inputs).forEach(input => {
            // O nome de usuário (login) não pode ser alterado pela API
            if (input) input.disabled = input === inputs.usuario ? true : !habilitar;
        });
    }

    // 3. Salvar alterações
    async function salvarDados() {
        // A API usa "nome" (e não "nomeCompleto") e não aceita trocar o "usuario"
        const novosDados = {
            nome: inputs.nomeCompleto.value.trim(),
            telefone: inputs.telefone.value.trim(),
            email: inputs.email.value.trim()
        };

        btnEditar.disabled = true;
        btnText.textContent = "A salvar...";
        btnIcon.className = "spinner-btn";

        try {
            // Endpoint: PUT /api/perfil (o apiFetch já envia o token)
            const resposta = await apiFetch("/api/perfil", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novosDados)
            });
            const resultado = await resposta.json().catch(() => ({}));
            if (!resposta.ok) throw new Error(resultado.message || "Erro ao salvar o perfil.");

            // Só atualiza o que está guardado no navegador depois que a API confirmou
            const atual = JSON.parse(localStorage.getItem("usuarioLogado")) || {};
            localStorage.setItem("usuarioLogado", JSON.stringify({ ...atual, ...(resultado.usuario || novosDados) }));

            alert("Informações do perfil atualizadas com sucesso!");

            emModoEdicao = false;
            alternarCampos(false);
            btnEditar.classList.remove("salvando");
            btnIcon.className = "fas fa-edit";
            btnText.textContent = "Editar informações";

        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert(error.message || "Erro ao guardar as alterações. Tente novamente.");
            // Continua em modo de edição para o usuário tentar de novo
            btnIcon.className = "fas fa-save";
            btnText.textContent = "Salvar alterações";
        } finally {
            btnEditar.disabled = false;
        }
    }

    if (btnEditar) {
        btnEditar.addEventListener("click", () => {
            if (!emModoEdicao) {
                emModoEdicao = true;
                alternarCampos(true);
                inputs.nomeCompleto.focus();

                btnEditar.classList.add("salvando");
                btnIcon.className = "fas fa-save";
                btnText.textContent = "Salvar alterações";
            } else {
                salvarDados();
            }
        });
    }

    carregarDadosUsuario();
    atualizarPerfilDaApi();
});