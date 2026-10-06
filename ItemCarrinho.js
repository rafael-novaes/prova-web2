import { Produto } from "./Produto.js";

export class ItemCarrinho {
  #produto;
  #quantidade;

  constructor(produto, quantidade) {
    if (quantidade <= 0) {
      throw new Error("A quantidade deve ser maior que zero.");
    }

    if (!(produto instanceof Produto)){
      throw new Error("O objeto encaminhado não é da classe Produto")
    }
    this.#produto = produto;
    this.#quantidade = quantidade;
  }

  getQuantidade() {
    return this.#quantidade;
  }

  setQuantidade(quantidadeNova) {
    if (quantidadeNova <= 0) {
      throw new Error("A quantidade deve ser maior que zero.");
    }

    this.#quantidade = quantidadeNova;
  }

  getProduto() {
    return this.#produto;
  }
}