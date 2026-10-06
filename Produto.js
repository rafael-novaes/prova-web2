export class Produto {
  #id;
  #nome;
  #descricao;
  #preco;
  #imagem;
  #categoria;

  static #proximoId = 1;

  // O parâmetro id só é usado ao recuperar um produto salvo no localStorage.
  // Ao criar um produto novo, o id continua sendo gerado automaticamente.
  constructor (nome, descricao, preco, imagem, categoria, id){
    if (id !== undefined) {
      this.#id = id;
      if (id >= Produto.#proximoId) {
        Produto.#proximoId = id + 1;
      }
    } else {
      this.#id = Produto.#proximoId++;
    }
    this.#nome = nome;
    this.#descricao = descricao;
    this.#preco = preco;
    this.#imagem = imagem;
    this.#categoria = categoria;
  }

  getId() {
    return this.#id;
  }

  getNome() {
    return this.#nome;
  }

  setNome(nome) {
    this.#nome = nome;
  }

  getDescricao() {
    return this.#descricao;
  }

  setDescricao(descricao) {
    this.#descricao = descricao;
  }

  getPreco() {
    return this.#preco
  }

  setPreco(preco) {
    if (preco < 0) {
      throw new Error("O preço não pode ser negativo.");
    }

    this.#preco = preco;
  }

  getCategoria() {
    return this.#categoria;
  }

  setCategoria(categoria) {
    this.#categoria = categoria;
  }

  getImagem() {
    return this.#imagem;
  }

  setImagem(imagem) {
    this.#imagem = imagem;
  }

  // Converte o produto em objeto simples para salvar como JSON
  paraObjeto() {
    return {
      id: this.#id,
      nome: this.#nome,
      descricao: this.#descricao,
      preco: this.#preco,
      imagem: this.#imagem,
      categoria: this.#categoria
    };
  }

  // Reconstrói um Produto (instância da classe) a partir do objeto salvo
  static deObjeto(dados) {
    return new Produto(dados.nome, dados.descricao, dados.preco, dados.imagem, dados.categoria, dados.id);
  }
}
