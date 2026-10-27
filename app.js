import { Produto } from "./Produto.js";
import { ItemCarrinho } from "./ItemCarrinho.js";
import { Carrinho } from "./Carrinho.js";
import { Pedido } from "./Pedido.js";
import { Repository } from "./Repository.js";

// ===== Estado da aplicação (objetos das classes) =====

const CATEGORIAS = ["Regata", "Tênis", "Bola", "Acessório"];
const STATUS_PEDIDO = ["Recebido", "Em preparo", "Pronto", "Entregue"];
const IMAGEM_PADRAO = "../media/imagem-cards.png";

const repository = new Repository();
const carrinho = new Carrinho();
let produtoEmEdicao = null;

// Recupera os dados salvos; se for a primeira vez, cria os produtos iniciais
if (!repository.carregarDoStorage()) {
  criarProdutosIniciais();
}

function criarProdutosIniciais() {
  const produtos = [
    new Produto("Regata de Basquete do Golden State", "Camiseta celebrativa de 20 anos de carreira do Curry.", 39.9, "media/regata-basquete.jpg", "Jersey"),
    new Produto("Tênis Jordan Lançamento", "Tênis que remetem a época de Chicago Bulls do Jordan.", 42.9, "media/tenis-basquete.jpg", "Tênis"),
    new Produto("Bola Spalding", "Perfeita para uso em quadras externas.", 45.9, "media/bola-basquete.jpg", "Bola"),
    new Produto("Meia cano alto NBA", "3 pares de meias coloridos da NBA", 22, "media/meia-nba.jpg", "Acessório"),
    new Produto("Regata de Basquete do Chicago", "Camiseta relíquia de 30 anos de carreira do Jordan.", 39.9, "media/regata-basquete2.jpg", "Jersey"),
    new Produto("Tênis Nike Precision 6", "Ótimo para troca de direção rápida e armadores.", 12, "media/tenis-basquete2.jpg", "Tênis"),
    new Produto("Bola WIlson", "Excelente para uso em quadras internas.", 45.9, "media/bola-basquete2.jpg", "Bola")
  ];
  produtos.forEach(produto => repository.adicionarProduto(produto));
}

// ===== Funções auxiliares =====

const $ = (id) => document.getElementById(id);

function moeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Cria um elemento do DOM sem usar innerHTML (evita injetar HTML digitado pelo usuário)
function criar(tag, atributos = {}, ...filhos) {
  const elemento = document.createElement(tag);
  for (const [chave, valor] of Object.entries(atributos)) {
    if (chave === "texto") {
      elemento.textContent = valor;
    } else if (chave === "classe") {
      elemento.className = valor;
    } else {
      elemento.setAttribute(chave, valor);
    }
  }
  elemento.append(...filhos);
  return elemento;
}

function criarImagem(produto, carregamentoTardio = true) {
  const img = criar("img", {
    src: produto.getImagem() || IMAGEM_PADRAO,
    alt: `Foto de ${produto.getNome()}`
  });
  if (carregamentoTardio) {
    img.loading = "lazy";
  }
  // se a imagem não existir, usa a imagem padrão (uma vez só, para não repetir o erro)
  img.addEventListener("error", () => { img.src = IMAGEM_PADRAO; }, { once: true });
  return img;
}

function mostrarToast(mensagem, tipo = "sucesso") {
  const toast = criar("div", { classe: tipo === "erro" ? "toast erro" : "toast", texto: mensagem });
  $("toasts").append(toast);
  setTimeout(() => toast.remove(), 3500);
}

function mostrarErros(lista, erros) {
  lista.replaceChildren(...erros.map(mensagem => criar("li", { texto: mensagem })));
  lista.hidden = erros.length === 0;
}

function itemDoCarrinho(idProduto) {
  return carrinho.getItens().find(item => item.getProduto().getId() === idProduto);
}

// ===== Renderização (Repository / Carrinho -> DOM) =====

function renderizarTudo() {
  renderizarCardapio();
  renderizarCarrinho();
}

function renderizarCardapio() {
  const produtos = repository.listarProdutos();
  $("lista-cardapio").replaceChildren(...produtos.map(criarCardProduto));
  $("cardapio-vazio").hidden = produtos.length > 0;
}

function criarCardProduto(produto) {
  return criar("article", { classe: "card" },
    criarImagem(produto),
    criar("div", { classe: "card-corpo" },
      criar("span", { classe: "etiqueta", texto: produto.getCategoria() }),
      criar("h3", { texto: produto.getNome() }),
      criar("p", { texto: produto.getDescricao() }),
      criar("p", { classe: "preco", texto: moeda(produto.getPreco()) }),
      criar("button", {
        classe: "btn btn-primario", type: "button",
        "data-acao": "adicionar", "data-id": produto.getId(),
        "aria-label": `Adicionar ${produto.getNome()} ao carrinho`,
        texto: "Adicionar ao carrinho"
      })
    )
  );
}

function renderizarCarrinho() {

  const itens = carrinho.getItens();
  $("itens-carrinho").replaceChildren(...itens.map(criarLinhaCarrinho));
  $("carrinho-vazio").hidden = itens.length > 0;

  const quantidade = carrinho.getQuantidadeTotal();
  $("contador-carrinho").textContent = quantidade;
  $("link-carrinho").setAttribute("aria-label", `Carrinho, ${quantidade} ${quantidade === 1 ? "item" : "itens"}`);

  $("resumo-subtotal").textContent = moeda(carrinho.calcularSubtotal());
  $("resumo-taxa").textContent = moeda(carrinho.calcularTaxaDeEntrega());
  $("resumo-total").textContent = moeda(carrinho.calcularTotal());
  $("motivo-taxa").textContent = motivoDaTaxa();

  $("btn-finalizar").disabled = itens.length === 0;
  $("btn-limpar").disabled = itens.length === 0;
}

function motivoDaTaxa() {
  const tipo = carrinho.getTipoEntrega();
  if (carrinho.aplicaTaxaDeEntrega()) {
    return `Taxa de ${moeda(Carrinho.TAXA_ENTREGA)} aplicada: pedido de marmita para delivery.`;
  }
  if (tipo === "Delivery") {
    return "Sem taxa: no delivery, a taxa só vale para pedidos com marmita.";
  }
  return `Sem taxa: ${tipo} não paga taxa de entrega.`;
}

function criarLinhaCarrinho(item) {
  const produto = item.getProduto();
  const id = produto.getId();
  const nome = produto.getNome();

  const botaoQuantidade = (acao, simbolo, rotulo) => criar("button", {
    type: "button", "data-acao": acao, "data-id": id, "aria-label": rotulo, texto: simbolo
  });

  return criar("li", { classe: "item-carrinho" },
    criarImagem(produto),
    criar("div", { classe: "item-info" },
      criar("h3", { texto: nome }),
      criar("p", { texto: `${moeda(produto.getPreco())} cada` })
    ),
    criar("div", { classe: "item-controles", role: "group", "aria-label": `Quantidade de ${nome}` },
      botaoQuantidade("diminuir", "−", `Diminuir quantidade de ${nome}`),
      criar("span", { classe: "quantidade", texto: item.getQuantidade() }),
      botaoQuantidade("aumentar", "+", `Aumentar quantidade de ${nome}`)
    ),
    criar("p", { classe: "item-subtotal", texto: moeda(carrinho.getSubTotal(item)) }),
    criar("button", {
      classe: "btn btn-perigo", type: "button",
      "data-acao": "remover", "data-id": id,
      "aria-label": `Remover ${nome} do carrinho`, texto: "Remover"
    })
  );
}

// ===== Ações do carrinho =====

function adicionarAoCarrinho(id) {
  const produto = repository.buscarProduto(id);
  if (!produto) return;

  carrinho.adicionarItem(new ItemCarrinho(produto, 1));
  renderizarCarrinho();
  mostrarToast(`${produto.getNome()} adicionado ao carrinho.`);
}

function aumentarQuantidade(id) {
  const item = itemDoCarrinho(id);
  if (!item) return;

  carrinho.alterarQuantidade(item, item.getQuantidade() + 1);
  renderizarCarrinho();
}

function diminuirQuantidade(id) {
  const item = itemDoCarrinho(id);
  if (!item) return;

  if (item.getQuantidade() === 1) {
    // a quantidade não pode ser zero: perguntar se o usuário quer remover o item
    removerDoCarrinho(id);
    return;
  }
  carrinho.alterarQuantidade(item, item.getQuantidade() - 1);
  renderizarCarrinho();
}

function removerDoCarrinho(id) {
  const item = itemDoCarrinho(id);
  if (!item) return;

  if (!window.confirm(`Remover "${item.getProduto().getNome()}" do carrinho?`)) return;

  carrinho.removerItem(item);
  renderizarCarrinho();
  mostrarToast("Item removido do carrinho.");
}

function limparCarrinho() {
  if (carrinho.getItens().length === 0) return;
  if (!window.confirm("Deseja remover todos os itens do carrinho?")) return;

  carrinho.limpar();
  renderizarCarrinho();
  mostrarToast("Carrinho limpo.");
}


function iniciarEdicao(id) {
  const produto = repository.buscarProduto(id);
  if (!produto) return;

  produtoEmEdicao = produto;
  $("campo-nome").value = produto.getNome();
  $("campo-descricao").value = produto.getDescricao();
  $("campo-preco").value = produto.getPreco();
  $("campo-categoria").value = produto.getCategoria();
  $("campo-imagem").value = produto.getImagem();

  $("titulo-form-produto").textContent = `Editar produto #${produto.getId()}`;
  $("btn-salvar-produto").textContent = "Salvar alterações";
  $("btn-cancelar-edicao").hidden = false;
  mostrarErros($("erros-produto"), []);

  $("form-produto").scrollIntoView({ behavior: "smooth", block: "center" });
  $("campo-nome").focus({ preventScroll: true });
}

function sairDaEdicao() {
  produtoEmEdicao = null;
  $("form-produto").reset();
  $("titulo-form-produto").textContent = "Cadastrar produto";
  $("btn-salvar-produto").textContent = "Cadastrar produto";
  $("btn-cancelar-edicao").hidden = true;
  mostrarErros($("erros-produto"), []);
}

function excluirProduto(id) {
  const produto = repository.buscarProduto(id);
  if (!produto) return;

  if (!window.confirm(`Excluir "${produto.getNome()}" do cardápio?`)) return;

  // um produto que saiu do cardápio também sai do carrinho
  const item = itemDoCarrinho(id);
  if (item) carrinho.removerItem(item);

  if (produtoEmEdicao === produto) sairDaEdicao();

  repository.removerProduto(id);
  renderizarTudo();
  mostrarToast(`${produto.getNome()} removido do cardápio.`);
}

// ===== Finalização do pedido =====

function abrirFinalizacao() {
  if (carrinho.getItens().length === 0) {
    mostrarToast("Seu carrinho está vazio. Adicione itens antes de finalizar.", "erro");
    return;
  }

  $("pedido-resumo-entrega").textContent = carrinho.getTipoEntrega();
  $("pedido-resumo-total").textContent = moeda(carrinho.calcularTotal());
  $("grupo-endereco").hidden = carrinho.getTipoEntrega() !== "Delivery";
  mostrarErros($("erros-pedido"), []);
  $("dialogo-pedido").showModal();
}

function finalizarPedido(evento) {
  evento.preventDefault();

  const nome = $("pedido-nome").value.trim();
  const endereco = $("pedido-endereco").value.trim();
  const pagamento = $("pedido-pagamento").value;
  const tipo = carrinho.getTipoEntrega();

  const erros = [];
  if (carrinho.getItens().length === 0) erros.push("O carrinho está vazio.");
  if (nome.length < 3) erros.push("Informe o nome do cliente (mínimo 3 caracteres).");
  if (tipo === "Delivery" && endereco.length < 5) erros.push("Informe o endereço para o delivery.");
  if (!pagamento) erros.push("Escolha a forma de pagamento.");
  mostrarErros($("erros-pedido"), erros);
  if (erros.length > 0) return;

  const pedido = new Pedido(
    carrinho.calcularTotal(),
    "Recebido",
    new Date(),
    pagamento,
    carrinho.getItens(),
    nome,
    tipo === "Delivery" ? endereco : "",
    tipo
  );
  repository.adicionarPedido(pedido);

  carrinho.limpar();
  $("form-pedido").reset();
  $("dialogo-pedido").close();
  renderizarTudo();
  mostrarToast(`Pedido #${pedido.getId()} realizado com sucesso!`);
  $("pedidos").scrollIntoView({ behavior: "smooth" });
}

function alterarStatusPedido(id, status) {
  const pedido = repository.buscarPedido(id);
  if (!pedido) return;

  pedido.setStatus(status);
  repository.atualizarPedido(pedido);
  mostrarToast(`Status do pedido #${id} alterado para "${status}".`);
}


// ===== Eventos da interface =====

function configurarEventos() {
  // Um único listener para todos os botões com data-acao (cardápio, carrossel, carrinho e admin)
  document.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-acao]");
    if (!botao) return;

    const id = Number(botao.dataset.id);
    const acoes = {
      adicionar: adicionarAoCarrinho,
      aumentar: aumentarQuantidade,
      diminuir: diminuirQuantidade,
      remover: removerDoCarrinho,
      editar: iniciarEdicao,
      excluir: excluirProduto
    };
    acoes[botao.dataset.acao]?.(id);
  });

  document.querySelectorAll('input[name="tipo-entrega"]').forEach(radio => {
    radio.addEventListener("change", () => {
      carrinho.setTipoEntrega(radio.value);
      renderizarCarrinho();
    });
  });

  // menu do celular
  const menu = $("menu-principal");
  const botaoMenu = $("menu-toggle");
  const alternarMenu = (aberto) => {
    menu.classList.toggle("aberto", aberto);
    botaoMenu.setAttribute("aria-expanded", String(aberto));
    botaoMenu.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  };
  botaoMenu.addEventListener("click", () => alternarMenu(!menu.classList.contains("aberto")));
  menu.addEventListener("click", (evento) => {
    if (evento.target.closest("a")) alternarMenu(false);
  });
}

// ===== Inicialização =====

function iniciar() {
  configurarEventos();
  renderizarTudo();
}

iniciar();

const btncarrinho = document.getElementById('link-carrinho')
const sectionCarrinho = document.getElementById('carrinho')
const btn_voltar_carrinho  = document.getElementById('voltar-carrinho')

btncarrinho.addEventListener('click', () => {
  sectionCarrinho.style.display = "block"  
})

btn_voltar_carrinho.addEventListener('click', () => {
  sectionCarrinho.style.display = "none"
})

const btnLimparCarrinho = document.getElementById('btn-limpar')
btnLimparCarrinho.addEventListener('click' , () => {
  carrinho.limpar();
  renderizarCarrinho();
})

$('btn-finalizar').addEventListener('click', (e) => {
  finalizarPedido(e)
})