import { Produto } from "./Produto.js";
import { ItemCarrinho } from "./ItemCarrinho.js";

export class Pedido {
  #id;
  #data;
  #status;
  #total;
  #formaPgto;
  #cliente;
  #itens = [];
  #endereco;
  #tipoEntrega;

  static #proximoId = 1;

  // tipoEntrega: "Delivery", "Retirada" ou "Consumo no local" (diferente de formaPgto: Pix, Cartão, Dinheiro)
  // O parâmetro id só é usado ao recuperar um pedido salvo no localStorage.
  constructor(total, status, data, formaPgto, itens, cliente, endereco, tipoEntrega, id) {
    if (id !== undefined) {
      this.#id = id;
      if (id >= Pedido.#proximoId) {
        Pedido.#proximoId = id + 1;
      }
    } else {
      this.#id = Pedido.#proximoId++;
    }
    this.#total = total;
    this.#status = status;
    this.#data = data;
    this.#formaPgto = formaPgto;
    this.#cliente = cliente
    // O pedido guarda uma cópia dos itens, com o preço da hora da compra.
    // Assim, editar um produto depois não altera pedidos já finalizados.
    this.#itens = itens.map(item => new ItemCarrinho(
      Produto.deObjeto(item.getProduto().paraObjeto()),
      item.getQuantidade()
    ));
    this.#endereco = endereco;
    this.#tipoEntrega = tipoEntrega;
  }

  getId() {
    return this.#id;
  }

  getTotal() {
    return this.#total;
  }

  getData() {
    return this.#data;
  }

  getStatus() {
    return this.#status;
  }

  setStatus(status) {
    this.#status = status;
  }

  getFormaPgto() {
    return this.#formaPgto;
  }

  setFormaPgto(formaPgto) {
    this.#formaPgto = formaPgto;
  }

  getCliente() {
    return this.#cliente;
  }

  setCliente(cliente) {
    this.#cliente = cliente;
  }

  getItens() {
    return [...this.#itens];
  }

  getEndereco() {
    return this.#endereco;
  }

  setEndereco(endereco) {
    this.#endereco = endereco;
  }

  getTipoEntrega() {
    return this.#tipoEntrega;
  }

  setTipoEntrega(tipoEntrega) {
    this.#tipoEntrega = tipoEntrega;
  }

  // Converte o pedido em objeto simples para salvar como JSON
  paraObjeto() {
    return {
      id: this.#id,
      total: this.#total,
      status: this.#status,
      data: this.#data.toISOString(),
      formaPgto: this.#formaPgto,
      cliente: this.#cliente,
      endereco: this.#endereco,
      tipoEntrega: this.#tipoEntrega,
      itens: this.#itens.map(item => ({
        produto: item.getProduto().paraObjeto(),
        quantidade: item.getQuantidade()
      }))
    };
  }

  // Reconstrói um Pedido (com Produto e ItemCarrinho reais) a partir do objeto salvo
  static deObjeto(dados) {
    const itens = dados.itens.map(i => new ItemCarrinho(Produto.deObjeto(i.produto), i.quantidade));
    return new Pedido(
      dados.total, dados.status, new Date(dados.data), dados.formaPgto,
      itens, dados.cliente, dados.endereco, dados.tipoEntrega, dados.id
    );
  }
}
