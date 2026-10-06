import { Produto } from "./Produto.js";
import { Pedido } from "./Pedido.js";

const CHAVE_PRODUTOS = "pizzaria:produtos";
const CHAVE_PEDIDOS = "pizzaria:pedidos";

export class Repository {
  #produtos = new Map();
  #pedidos = new Map();

  // CRUD Produto

  adicionarProduto(produto){
    this.#produtos.set(produto.getId(), produto);
    this.#salvar();
  }

  buscarProduto(id) {
    return this.#produtos.get(id)
  }

  listarProdutos() {
    return [...this.#produtos.values()];
  }

  atualizarProduto(produto) {
    if (!this.#produtos.has(produto.getId())) {
      throw new Error("Produto não encontrado.");
    }

    this.#produtos.set(produto.getId(), produto);
    this.#salvar();
  }

  removerProduto(id) {
    this.#produtos.delete(id)
    this.#salvar();
  }

  // CRUD Pedido

  adicionarPedido(pedido){
    this.#pedidos.set(pedido.getId(), pedido);
    this.#salvar();
  }

  buscarPedido(id) {
    return this.#pedidos.get(id)
  }

  listarPedidos() {
    return [...this.#pedidos.values()];
  }

  atualizarPedido(pedido) {
    if (!this.#pedidos.has(pedido.getId())) {
      throw new Error("Pedido não encontrado.");
    }

    this.#pedidos.set(pedido.getId(), pedido);
    this.#salvar();
  }

  removerPedido(id) {
    this.#pedidos.delete(id)
    this.#salvar();
  }

  // Persistência (bônus): os Maps continuam sendo a fonte principal dos dados,
  // o localStorage é só uma cópia em JSON para não perder nada ao recarregar.

  #salvar() {
    if (typeof localStorage === "undefined") return;

    try {
      localStorage.setItem(CHAVE_PRODUTOS, JSON.stringify(this.listarProdutos().map(p => p.paraObjeto())));
      localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(this.listarPedidos().map(p => p.paraObjeto())));
    } catch (erro) {
      console.warn("Não foi possível salvar no localStorage:", erro);
    }
  }

  // Retorna true se havia dados salvos (mesmo que a lista esteja vazia)
  carregarDoStorage() {
    if (typeof localStorage === "undefined") return false;

    try {
      const produtos = localStorage.getItem(CHAVE_PRODUTOS);
      const pedidos = localStorage.getItem(CHAVE_PEDIDOS);

      if (produtos !== null) {
        JSON.parse(produtos).forEach(dados => {
          const produto = Produto.deObjeto(dados);
          this.#produtos.set(produto.getId(), produto);
        });
      }

      if (pedidos !== null) {
        JSON.parse(pedidos).forEach(dados => {
          const pedido = Pedido.deObjeto(dados);
          this.#pedidos.set(pedido.getId(), pedido);
        });
      }

      return produtos !== null;
    } catch (erro) {
      console.warn("Dados salvos inválidos, usando dados iniciais:", erro);
      this.#produtos.clear();
      this.#pedidos.clear();
      return false;
    }
  }
}
