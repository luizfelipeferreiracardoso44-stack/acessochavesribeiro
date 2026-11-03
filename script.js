// CARREGAR DADOS SALVOS

let chaves = JSON.parse(
    localStorage.getItem("chaves")
) || [
    {
        codigo: "CH001",
        nome: "Apartamento 101",
        status: "Disponível",
        responsavel: ""
    },
    {
        codigo: "CH002",
        nome: "Apartamento 102",
        status: "Disponível",
        responsavel: ""
    },
    {
        codigo: "CH003",
        nome: "Salão de festas",
        status: "Disponível",
        responsavel: ""
    },
    {
        codigo: "CH004",
        nome: "Portão principal",
        status: "Disponível",
        responsavel: ""
    },
    {
        codigo: "CH005",
        nome: "Casa de máquinas",
        status: "Disponível",
        responsavel: ""
    }
];

let historico = JSON.parse(
    localStorage.getItem("historico")
) || [];


// SALVAR INFORMAÇÕES

function salvarDados() {

    localStorage.setItem(
        "chaves",
        JSON.stringify(chaves)
    );

    localStorage.setItem(
        "historico",
        JSON.stringify(historico)
    );

}


// ATUALIZAR PAINEL

function atualizarPainel() {

    document.getElementById("total").textContent =
        chaves.length;

    document.getElementById("disponiveis").textContent =
        chaves.filter(c => c.status === "Disponível").length;

    document.getElementById("emprestadas").textContent =
        chaves.filter(c => c.status === "Emprestada").length;

}


// ATUALIZAR LISTA

function renderizarChaves() {

    const lista = document.getElementById("listaChaves");

    const busca = document.getElementById("pesquisa")
        .value.toLowerCase();

    lista.innerHTML = "";

    const filtradas = chaves.filter(chave =>
        chave.nome.toLowerCase().includes(busca) ||
        chave.codigo.toLowerCase().includes(busca)
    );

    filtradas.forEach(chave => {

        const linha = document.createElement("tr");

        const classe = chave.status === "Disponível"
            ? "disponivel"
            : "emprestada";

        linha.innerHTML = `
            <td>${chave.codigo}</td>
            <td>${chave.nome}</td>
            <td>${chave.responsavel || "-"}</td>
            <td>
                <span class="status ${classe}">
                    ${chave.status}
                </span>
            </td>
        `;

        lista.appendChild(linha);

    });

    atualizarPainel();
    atualizarSelecao();

}


// ATUALIZAR SELEÇÃO DE CHAVES

function atualizarSelecao() {

    const select = document.getElementById("codigo");

    const valorAtual = select.value;

    select.innerHTML =
        '<option value="">Selecione uma chave</option>';

    chaves.forEach(chave => {

        const opcao = document.createElement("option");

        opcao.value = chave.codigo;

        opcao.textContent =
            chave.codigo + " - " + chave.nome;

        select.appendChild(opcao);

    });

    if (chaves.some(c => c.codigo === valorAtual)) {
        select.value = valorAtual;
    }

    atualizarAviso();

}


// IDENTIFICAR SITUAÇÃO DA CHAVE

function atualizarAviso() {

    const codigo = document.getElementById("codigo").value;

    const chave = chaves.find(c => c.codigo === codigo);

    const aviso = document.getElementById("aviso");

    if (!chave) {

        aviso.textContent =
            "Selecione uma chave para verificar sua situação.";

        return;

    }

    if (chave.status === "Disponível") {

        aviso.textContent =
            "Esta chave está disponível para retirada.";

    } else {

        aviso.textContent =
            "Esta chave está com " + chave.responsavel +
            ". Somente o responsável poderá devolvê-la.";

    }

}

document.getElementById("codigo").addEventListener(
    "change",
    atualizarAviso
);


// REGISTRAR RETIRADA OU DEVOLUÇÃO

function movimentarChave() {

    const usuario = document.getElementById("usuario")
        .value.trim();

    const codigo = document.getElementById("codigo").value;

    if (!usuario || !codigo) {

        alert("Preencha seu nome e selecione uma chave.");

        return;

    }

    const chave = chaves.find(c => c.codigo === codigo);

    if (!chave) return;

    let operacao;

    if (chave.status === "Disponível") {

        operacao = "Retirada";

        chave.status = "Emprestada";

        chave.responsavel = usuario;

    } else {

        if (
            chave.responsavel.toLowerCase() !==
            usuario.toLowerCase()
        ) {

            alert(
                "Esta chave está emprestada para " +
                chave.responsavel +
                ". Somente essa pessoa poderá registrar a devolução."
            );

            return;

        }

        operacao = "Devolução";

        chave.status = "Disponível";

        chave.responsavel = "";

    }

    const data = new Date();

    historico.unshift({

        chave: chave.nome,

        codigo: chave.codigo,

        usuario: usuario,

        operacao: operacao,

        data: data.toLocaleDateString("pt-BR"),

        horario: data.toLocaleTimeString("pt-BR")

    });

    salvarDados();

    renderizarChaves();

    renderizarHistorico();

    document.getElementById("usuario").value = "";

    document.getElementById("codigo").value = "";

    atualizarAviso();

    alert(
        operacao + " registrada com sucesso!"
    );

}


// CADASTRAR NOVA CHAVE

function cadastrarChave() {

    const nome = prompt(
        "Digite a identificação da chave:"
    );

    if (!nome || !nome.trim()) return;

    const codigo = prompt(
        "Digite o código da tag RFID:"
    );

    if (!codigo || !codigo.trim()) return;

    const codigoNormalizado = codigo.trim().toUpperCase();

    if (chaves.some(c => c.codigo === codigoNormalizado)) {

        alert("Este código já está cadastrado.");

        return;

    }

    chaves.push({

        codigo: codigoNormalizado,

        nome: nome.trim(),

        status: "Disponível",

        responsavel: ""

    });

    salvarDados();

    renderizarChaves();

    alert("Chave cadastrada com sucesso!");

}


// MOSTRAR HISTÓRICO

function renderizarHistorico() {

    const area = document.getElementById("historico");

    area.innerHTML = "";

    if (historico.length === 0) {

        area.innerHTML =
            '<p class="vazio">Nenhuma movimentação registrada.</p>';

        return;

    }

    historico.slice(0, 10).forEach(item => {

        const div = document.createElement("div");

        div.className = "historico-item";

        const texto = document.createElement("strong");

        texto.textContent =
            item.operacao + " - " + item.chave;

        const detalhes = document.createElement("small");

        detalhes.textContent =
            item.usuario + " | " +
            item.data + " às " + item.horario;

        div.appendChild(texto);

        div.appendChild(detalhes);

        area.appendChild(div);

    });

}


// INICIALIZAR SISTEMA

renderizarChaves();

renderizarHistorico();