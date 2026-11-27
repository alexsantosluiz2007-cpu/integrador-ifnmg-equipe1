// =====================================================
// SERVIÇO COMPARTILHADO DE SENSORES
// Carregue este arquivo ANTES do JS de cada tela:
//   <script src="JS/sensores.js"></script>
//   <script src="JS/dash.js"></script>
// =====================================================
const SensoresAPI = (() => {
    // A URL fica só aqui (antes estava repetida em cada tela)
    // Endpoint: GET /api/sensores (valor + status "ativo" de cada sensor e "online" do Arduino)
    // O endereço base da API fica em ../config.js
    const CAMINHO_API = "/api/sensores";
    const INTERVALO_MS = 3000;   // de quanto em quanto tempo busca
    const TIMEOUT_MS = 5000;     // desiste da requisição se demorar demais
    const CHAVE_CACHE = "ultimaLeituraSensores";

    const ouvintesLeitura = new Set();
    const ouvintesErro = new Set();
    let timer = null;
    let ativo = false;
    let buscando = false;

    // Última leitura guardada (serve para a tela já abrir com valores)
    function lerCache() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE_CACHE));
        } catch {
            return null;
        }
    }

    // Aceita objeto ou lista (pega o último) e padroniza os nomes
    function normalizar(dados) {
        const l = Array.isArray(dados) ? dados[dados.length - 1] : dados;
        if (!l) return null;
        // Aceita número ou objeto { valor } (formato de /api/sensores)
        const num = v => (v && typeof v === "object" ? v.valor : v);
        const leitura = {
            temperatura: num(l.temperatura ?? l.temp) ?? null,
            umidade: num(l.umidade ?? l.umi) ?? null,
            luminosidade: num(l.luminosidade ?? l.lux) ?? null,
            ultimaAtualizacao: l.ultimaAtualizacao ?? null,
            online: typeof l.online === "boolean" ? l.online : null,
            // Status individual de cada sensor (a API informa em /api/sensores)
            ativos: {}
        };
        ["temperatura", "umidade", "luminosidade"].forEach(nome => {
            const s = l[nome];
            if (s && typeof s === "object" && typeof s.ativo === "boolean") leitura.ativos[nome] = s.ativo;
        });
        const semDados = leitura.temperatura === null && leitura.umidade === null && leitura.luminosidade === null;
        // Arduino ainda não enviou nada: não inventa uma leitura "de agora"
        if (semDados && !leitura.ultimaAtualizacao) return null;
        if (!leitura.ultimaAtualizacao) leitura.ultimaAtualizacao = new Date().toISOString();
        return leitura;
    }

    async function buscar() {
        // Não empilha requisições se a anterior ainda não terminou
        if (buscando) return;
        buscando = true;

        try {
            // O token já identifica o usuário, então não precisa mandar ?usuario=
            const resposta = await apiFetch(CAMINHO_API, {
                cache: "no-cache",
                signal: AbortSignal.timeout(TIMEOUT_MS)
            });
            if (!resposta.ok) throw new Error("Erro HTTP: " + resposta.status);

            const leitura = normalizar(await resposta.json());
            if (!leitura) return;

            localStorage.setItem(CHAVE_CACHE, JSON.stringify(leitura));
            ouvintesLeitura.forEach(fn => fn(leitura));
        } catch (erro) {
            ouvintesErro.forEach(fn => fn(erro));
        } finally {
            buscando = false;
        }
    }

    function agendar() {
        buscar();
        timer = setInterval(buscar, INTERVALO_MS);
    }

    // Registra uma função que roda a cada leitura nova.
    // replay: true  -> já chama na hora com a última leitura guardada
    //         false -> só chama quando chegar leitura nova (use em alertas)
    function aoReceber(fn, { replay = true } = {}) {
        ouvintesLeitura.add(fn);
        const cache = replay ? lerCache() : null;
        if (cache) fn(cache);
    }

    function aoFalhar(fn) {
        ouvintesErro.add(fn);
    }

    function iniciar() {
        if (ativo) return;
        ativo = true;
        agendar();
    }

    // Pausa as requisições quando a aba está em segundo plano
    document.addEventListener("visibilitychange", () => {
        if (!ativo) return;
        clearInterval(timer);
        if (!document.hidden) agendar();
    });

    return { aoReceber, aoFalhar, iniciar, ultima: lerCache };
})();
