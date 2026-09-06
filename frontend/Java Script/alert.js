const botoes =
    document.querySelectorAll(".botao-h");

const paginaAtual =
    window.location.pathname
        .split("/")
        .pop();
botoes.forEach(botao => {

    const paginaBotao =
        botao.getAttribute("href");

    if (paginaBotao === paginaAtual) {

        botao.classList.add("ativo");
    }

});
function atualizarRelogio() {

    const agora = new Date();

    const horas = String(agora.getHours()).padStart(2, "0");
    const minutos = String(agora.getMinutes()).padStart(2, "0");
    const segundos = String(agora.getSeconds()).padStart(2, "0");

    document.getElementById("relogio").textContent =
        `${horas}:${minutos}:${segundos}`;
}

atualizarRelogio();

setInterval(atualizarRelogio, 1000);