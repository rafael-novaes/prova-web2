export class Carrinho {
  static TIPOS_ENTREGA = ["Delivery", "Retirada", "Consumo no local"];
  static TAXA_ENTREGA = 2.5;

  #itens = [];
  #tipoEntrega = "Delivery";

  getItens() {
      return [...this.#itens];
  }

  // Se o produto já estiver no carrinho, soma a quantidade em vez de duplicar o item
  adicionarItem(item) {
    const existente = this.#itens.find(
      i => i.getProduto().getId() === item.getProduto().getId()
    );

    if (existente) {
      existente.setQuantidade(existente.getQuantidade() + item.getQuantidade());
    } else {
      this.#itens.push(item);
    }
  }

  removerItem(itemARemover) {
    this.#itens = this.#itens.filter(item => item !== itemARemover);
  }

  limpar() {
    this.#itens = [];
  }

  alterarQuantidade(itemAAlterar, quantidadeNova) {
    const item = this.#itens.find(item => item === itemAAlterar);

    if (!item) {
      throw new Error("Item não encontrado no carrinho.");
    }

    // a validação (quantidade > 0) já é feita pelo ItemCarrinho
    item.setQuantidade(quantidadeNova);
  }

  getQuantidadeTotal() {
    return this.#itens.reduce((soma, item) => soma + item.getQuantidade(), 0);
  }

  getTipoEntrega() {
    return this.#tipoEntrega;
  }

  setTipoEntrega(tipo) {
    if (!Carrinho.TIPOS_ENTREGA.includes(tipo)) {
      throw new Error("Tipo de entrega inválido.");
    }

    this.#tipoEntrega = tipo;
  }

  // subtotal de um único item (quantidade x preço)
  getSubTotal(itemACalcular) {
    const item = this.#itens.find(item => item === itemACalcular)

    if(item){
      return item.getQuantidade() * item.getProduto().getPreco();
    }
    return 0;
  }

  // subtotal do carrinho: soma apenas os produtos, sem a taxa de entrega
  calcularSubtotal() {
    let subtotal = 0;
    this.#itens.forEach(item => {
      subtotal += this.getSubTotal(item);
    });
    return subtotal;
  }

  temMarmita() {
    return this.#itens.some(
      item => item.getProduto().getCategoria().toLowerCase() === "marmita"
    );
  }

  // Regra do enunciado: taxa só quando for marmita E entrega via delivery
  aplicaTaxaDeEntrega() {
    return this.#tipoEntrega === "Delivery" && this.temMarmita();
  }

  calcularTaxaDeEntrega() {
    if (this.aplicaTaxaDeEntrega()) {
      return Carrinho.TAXA_ENTREGA;
    }
    return 0;
  }

  // total = subtotal + taxa de entrega
  calcularTotal(){
    return this.calcularSubtotal() + this.calcularTaxaDeEntrega();
  }
}
