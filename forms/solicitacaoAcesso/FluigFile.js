class FluigFile {
  constructor() {
    throw 'Esta classe não pode ser instanciada';
  }

  /**
   * @authors Autímio, Felipe, Murilo e Gabriel - TBC
   *
   * @param {String} funcao - Valor referente ao comportamento que a função irá assumir.
   * - criarPasta -> Cria uma pasta
   * - listarDocumentos -> Lista os documentos da pasta
   * - remover -> Remove um documento ou pasta
   * - alterar -> Alterar uma pasta
   * @param {String} dadosJson JSON em formato String com os dados da requisição.
   *
   * @returns {Object} Dados obtidos na resposta do ajax.
   */
  static ajaxApi(funcao, dadosJson) {
    const restApiEcm = 'api/public/ecm/document';
    let url;
    let metodo = 'POST';
    let assincrono = false;
    let resultado = null;

    switch (funcao) {
      case 'criarArquivo':
        url = `/${restApiEcm}/createDocument`;
        break;
      case 'criarPasta':
        url = `/api/public/2.0/folderdocuments/create`;
        break;
      case 'listarDocumentos':
        url = `/${restApiEcm}/listDocument/${dadosJson}`;
        metodo = 'GET';
        break;
      case 'remover':
        url = `/${restApiEcm}/remove`;
        break;
      case 'alterarDescricao':
        url = `/${restApiEcm}/updateDescription`;
        break;
      case 'alterar':
        url = `/${restApiEcm}/updateDocumentFolder`;
        break;
      default:
        Util.exibirToast('Erro!', 'Função não encontrada.', 'danger', 4000);
        console.log('Função ajax não encontrada.');
        return null;
    }

    $.ajax({
      async: assincrono,
      url: url,
      type: metodo,
      data: typeof dadosJson == 'string' ? dadosJson : JSON.stringify(dadosJson),
      contentType: 'application/json',
      success: (dados) => {
        resultado = dados;
      },
      error: (objErro, status, msg) => {
        console.log(`Erro: ${status} - ${msg}`);
        resultado = objErro;
      }
    });

    return resultado;
  }

  /**
   * Método para anexar arquivo no ECM do fluig.
   *
   * @param {Object} elemento Arquivo que será salvo no fluig.
   * @param {String} tipo São aceitos: 'cotacoes' ou 'reservas'.
   * @param {String} categoria Categoria do tipo de cotação/reserva, são aceitos:
   * 	- 'aereo'
   * 	- 'hosp'
   * 	- 'locVei'
   * 	- 'transfer'
   *  - 'segViagem'
   */
  static anexarArquivo(elementoAnexoDOM, categoria, callback) {
    $(() => {
        $(elementoAnexoDOM).fileupload({
            dataType: 'json',
            done: (e, data) => {
                let nomeArquivo = 'arquivo';
                Util.carregamento(() => {
                    try {
                        // 1. Verifica/Cria a estrutura de pastas
                        let jsonPastas = FluigFile.verificarCriarEstrutura(categoria);
                        
                        // 2. Verificação defensiva da estrutura
                        if (!jsonPastas?.pastaRaiz?.filhos?.pastaSolicitacao?.filhos?.[categoria]) {
                            throw new Error(`Estrutura da categoria ${categoria} inválida`);
                        }

                        const pastaCategoria = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria];
                        
                        // 3. Inicializa array de arquivos se não existir
                        if (!Array.isArray(pastaCategoria.arquivos)) {
                            pastaCategoria.arquivos = [];
                        }

                        $.each(data.result.files, (index, file) => {
                            nomeArquivo = FluigFile.formatarNomeArquivo(file.name, categoria, jsonPastas);
                            
                            // 4. Gravação do arquivo com tratamento de erro
                            const arquivo = FluigFile.gravarArquivo(pastaCategoria.id, nomeArquivo, file.name);
                            
                            if (arquivo?.content?.id) {
                                // 5. Adiciona metadados do arquivo
                                pastaCategoria.arquivos.push({
                                    id: arquivo.content.id,
                                    index: pastaCategoria.arquivos.length + 1,
                                    nome: nomeArquivo,
                                    ativo: 1, // Alterado para 1 (ativo)
                                    timestamp: new Date().toISOString() // Adiciona timestamp
                                });
                                
                                // 6. Atualiza o campo hidden
                                $('#jsonPastas').val(JSON.stringify(jsonPastas));
                                
                                // 7. Log para depuração
                                console.debug(`Arquivo ${nomeArquivo} (ID: ${arquivo.content.id}) salvo na categoria ${categoria}`);
                                
                                Util.exibirToast('Sucesso!', 'Arquivo salvo no ECM.', 'success');
                                callback(elementoAnexoDOM);
                            } else {
                                throw new Error('Resposta inválida do ECM ao gravar arquivo');
                            }
                        });
                    } catch (error) {
                        console.error('Erro no anexarArquivo:', error);
                        Util.exibirToast('Erro!', 'Falha ao processar arquivo. ' + error.message, 'danger');
                    }
                }, `Salvando ${nomeArquivo} no Fluig...`);
            },
            fail: (e, data) => {
                Util.exibirToast('Erro!', 'Falha no upload do arquivo.', 'danger');
                console.error('Falha no upload:', data.jqXHR.responseText);
            }
        });
    });
}

  static formatarNomeCategoria(categoria) {
    const nomeCategoria = {
      'arquivosSolicitacao': 'Arquivos Solicitação - Anexos',
      'arquivosTriagemDocs': 'Arquivos Triagem de Documentos - Anexos',
      'arquivosAcessoriaJur': 'Arquivos Assessoria Jurídica - Anexos',
      'arquivosVisitaTec': 'Arquivos Visita Técnica - Anexos',
      'arquivosLaisJaicler': 'Arquivos Lais/Jaicler - Anexos',
      'arquivosInformacoesAd': 'Arquivos Informações Adicionais - Anexos',
      'arquivosPreReuniao': 'Arquivos Pré Reunião - Anexos',
      'arquivosReuniao': 'Arquivos Reunião ADM - Anexos',
      'arquivosComiteCredito': 'Arquivos Comitê de Crédito - Anexos',
      'arquivosCadastro': 'Arquivos Cadastro - Anexos',
      'arquivosLancarCapital': 'Arquivos Lançar Capital Social - Anexos',
      'arquivosLancarInscricao': 'Arquivos Lançar Inscrição Estadual - Anexos',
      'parecerSupervisor': 'Parecer do Supervisor - Anexos',
      'arquivosParecerSupervisor': 'Arquivos Parecer Supervisor - Anexos',
      'default': categoria
    }
    return nomeCategoria[categoria] || nomeCategoria['default'];
  }

  static getOpcaoVersionamentoCategoria(categoria) {
    const versionOptions = {
      'default': VersionOptions.MANTER_VERSAO
    }
    return versionOptions[categoria] || versionOptions['default'];
  }

  static obterUrlArquivo(idArquivo) {
    return `${top.WCMAPI.serverURL}/portal/p/1/ecmnavigation?app_ecm_navigation_doc=${idArquivo}`;
  }

  static formatarNomeArquivo(nomeArquivo, categoria, jsonPastas) {
    let posicaoFormatoArquivo = nomeArquivo.lastIndexOf('.');
    nomeArquivo = nomeArquivo.substring(0, posicaoFormatoArquivo) + ' - ';
    if (jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].hasOwnProperty('id')) {
      let qtdArquivos = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos.length + 1; //tipos[tipo].categorias[categoria].arquivos.length + 1;
      nomeArquivo += (qtdArquivos > 9 ? qtdArquivos : '0' + qtdArquivos);
    } else {
      nomeArquivo += '01';
    }
    return nomeArquivo;
  }

  /**
   * Função que busca uma pasta específica através da descrição à partir de uma pasta pai.
   *
   * @param {string} codigoPastaPai Código da pasta pai no fluig.
   * @param {string} descricaoPasta descrição (nome) da pasta.
   *
   * @returns {string} Retorna o código da pasta encontrada ou null caso não exista.
   */
  static buscarPasta(codigoPastaPai, descricaoPasta) {
    const listaDePastasFilhas = FluigFile.ajaxApi('listarDocumentos', codigoPastaPai);
    let idPasta = null;
    listaDePastasFilhas.content.forEach(pasta => {
      if (pasta.description == descricaoPasta) {
        idPasta = pasta.id;
      }
    });
    return idPasta;
  }

  static getDocumentosPasta(codigoPastaPai) {
    return FluigFile.ajaxApi('listarDocumentos', codigoPastaPai);
  }

  /**
   * Função que cria pasta utilizando a API 2.0
   *
   * @param {String} codigoPastaPai Código da pasta pai no fluig.
   * @param {String} descricaoPasta descrição (nome) da pasta.
   *
   * @returns {Number} Código da pasta criada.
   */
  static criarPasta(codigoPastaPai, descricaoPasta, tipoVersionamento) {
    const dados = FluigFile.montarDadosPasta(codigoPastaPai, descricaoPasta, tipoVersionamento);
    const codigoPastaCriada = FluigFile.ajaxApi('criarPasta', JSON.stringify(dados));
    if (tipoVersionamento != VersionOptions.MANTER_VERSAO) {
      FluigFile.ajaxApi('alterar', JSON.stringify(FluigFile.montarDadosAlterarVersionamento(codigoPastaCriada, descricaoPasta, tipoVersionamento)));
    }
    return codigoPastaCriada;
  }

  /**
     * Função que monta os dados para criação de uma pasta em um JSON.
     *
     * @param {String} codigoPastaPai Código da pasta pai no fluig.
     * @param {String} descricaoPasta descrição (nome) da pasta.
     *
     * @return {Object} Retorna JSON com os dados que serão enviados na requisição.
     */
  static montarDadosPasta(codigoPastaPai, descricaoPasta) {
    return {
      'publisherId': 'admin',
      'documentDescription': descricaoPasta,
      'parentFolderId': codigoPastaPai,
      'publisherId': 'admin',
      'additionalComments': 'Pasta criada automaticamente pelo fluig.',
      'inheritSecurity': true,
      'permissionType': 12345,
      'restrictionType': 12345
    };
  }

  static montarDadosAlterarVersionamento(codigoDocumento, descricao, tipoVersionamento) {
    return {
      'documentId': codigoDocumento,
      'version': 1000,
      'documentDescription': descricao,
      'versionAction': '',
      'versionOption': tipoVersionamento,
      'additionalComments': 'Tipo de versionamento: revisão',
      'inheritSecurity': true,
      'downloadEnable': true
    }
  }

  static excluirArquivoPasta(id) {
    const dados = JSON.stringify({
      id
    });
    const arquivoFoiExcluido = FluigFile.ajaxApi('remover', dados);
    if (arquivoFoiExcluido.hasOwnProperty('content')) {
      Util.exibirToast('OK!', 'Arquivo excluído com sucesso.', 'success');
      return true;
    } else {
      Util.exibirToast('Atenção!', 'Erro ao excluir arquivo.', 'danger');
      return false;
    }
  }

  /**
   * Função usada para gravar um arquivo no ECM.
   *
   * @param {string} codigoPasta Id da pasta onde o arquivo deve ser gravado.
   * @param {string} nomeArquivoTratado Descrição do arquivo no ECM.
   * @param {string} nomeArquivoOriginal Descrição original do arquivo.
   *
   * @returns {Object} O resultado da requisição ajax.
   */
  static gravarArquivo(codigoPasta, nomeArquivoTratado, nomeArquivoOriginal) {
    const dados = JSON.stringify({
      'description': nomeArquivoTratado,
      'parentId': codigoPasta,
      'activeVersion': true,
      'inheritSecurity': true,
      'attachments': [{
        'fileName': nomeArquivoOriginal,
        'principal': true
      }],
      'downloadEnabled': true,
    });

    return FluigFile.ajaxApi('criarArquivo', dados);
  }


  static getJsonPadraoCategoria(categoria) {
    return {
      [categoria]: {
        id: '',
        desc: this.formatarNomeCategoria(categoria),
        arquivos: []
      }
    }
  }

  static getJsonPadrao(idPastaSolicitacoes) {
    return {
      pastaRaiz: {
        id: idPastaSolicitacoes,
        desc: '',
        filhos: {
          pastaSolicitacao: {
            id: '',
            desc: '',
            filhos: {
              /** Categorias */
            }
          }
        }
      }
    }
  }

  static verificarExclusaoPastasEmCadeia(jsonPastas, categoria) {
    const quantidadeArquivosCategoria = jsonPastas.pastaRaiz.filhos.
      pastaSolicitacao.filhos[categoria].arquivos.length;
    if (quantidadeArquivosCategoria < 1) {
      FluigFile.deletarCategoria(jsonPastas, categoria, jsonPastas.pastaRaiz.filhos.
        pastaSolicitacao.filhos[categoria].id);
    }
  }

  static deletarCategoria(jsonPastas, categoria, idCategoria) {
    if (Object.keys(jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos).length < 2) {
      const idPastaSolicitacao = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.id;
      FluigFile.deletarSolicitacao(jsonPastas, idPastaSolicitacao);
    } else {
      FluigFile.excluirArquivoPasta(idCategoria);
      delete jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria];
      $('#jsonPastas').val(JSON.stringify(jsonPastas));
    }
  }

  static deletarSolicitacao(jsonPastas, idSolicitacao) {
    const pastasSolicitacoesPastaRaiz = FluigFile.getDocumentosPasta(jsonPastas.pastaRaiz.id).content;
    if (pastasSolicitacoesPastaRaiz.length < 2) {
      const idPastaRaiz = jsonPastas.pastaRaiz.id;
      FluigFile.deletarRaiz(jsonPastas, idPastaRaiz);
    } else {
      FluigFile.excluirArquivoPasta(idSolicitacao);
      delete jsonPastas.pastaRaiz.filhos.pastaSolicitacao;
      $('#jsonPastas').val('{}');
    }
  }

  static deletarRaiz(jsonPastas, idPastaRaiz) {
    FluigFile.excluirArquivoPasta(idPastaRaiz);
    delete jsonPastas.pastaRaiz;
    $('#jsonPastas').val('{}');
  }


  static getJsonEstruturaInicial() {

    const CODIGO_PASTA_RAIZ_CADASTRO_CLIENTE = top.WCMAPI.serverURL.indexOf("serraverdetst") > -1 ? "6967" : "306";
    let jsonInicial = FluigFile.getJsonPadrao(CODIGO_PASTA_RAIZ_CADASTRO_CLIENTE);
    const numeroSolicitacao = formController.idProcesso;
    const nomeSolicitante = $('#nomeSolicitante').val();
    let descricaoPastaSolicitacao = Util.estaVazio(numeroSolicitacao) ? 'Solicitação em fase de inicialização' : `${numeroSolicitacao}`;
    descricaoPastaSolicitacao += ` - ${nomeSolicitante}`;
    // console.log(FluigFile.criarPasta(CODIGO_PASTA_RAIZ_CADASTRO_CLIENTE, descricaoPastaSolicitacao).content)
    let codigoPastaCriada = (FluigFile.criarPasta(CODIGO_PASTA_RAIZ_CADASTRO_CLIENTE, descricaoPastaSolicitacao)).content.documentId;
    if (Util.estaVazio(codigoPastaCriada)) {
      Util.exibirToast('Atenção!', `Erro ao criar pasta de descrição: ${descricaoPastaFilha}.`, 'danger');
      return null;
    }

    jsonInicial.pastaRaiz.id = CODIGO_PASTA_RAIZ_CADASTRO_CLIENTE;
    jsonInicial.pastaRaiz.filhos.pastaSolicitacao.id = codigoPastaCriada;
    jsonInicial.pastaRaiz.filhos.pastaSolicitacao.desc = descricaoPastaSolicitacao;
    return jsonInicial;
  }

  static getJsonPastas() {
    const jsonAtual = $('#jsonPastas').val();
    if (Util.estaVazio(jsonAtual)) {
      return FluigFile.getJsonEstruturaInicial();
    } else {
      return JSON.parse(jsonAtual);
    }
  }

  /**
   * Função à ser executada antes de salvar arquivos.
   * Busca e cria pastas no ECM de acordo com o número da solicitação e o nome do solicitante, sendo que cada despesa também possui sua pasta.
   *
   * @param {String} categoria Categoria do anexo. São aceitos:
   * 	- 'notaTecnica'
   *  - 'cestaCotacoes'
   * 	- 'rps'
   * 	- 'docForn'
   *
   * @returns {String} Código da pasta existente ou já criada para os comprovantes da solicitação.
   */
  static verificarCriarEstrutura(categoriaAnexo) {
    const jsonPastas = FluigFile.getJsonPastas();
    if (jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoriaAnexo] == undefined) {
      let jsonCategoria = FluigFile.getJsonPadraoCategoria(categoriaAnexo);
      jsonCategoria[categoriaAnexo].id = FluigFile.verificarCriarPasta(
        jsonPastas.pastaRaiz.filhos.pastaSolicitacao.id,
        this.formatarNomeCategoria(categoriaAnexo),
        this.getOpcaoVersionamentoCategoria(categoriaAnexo)
      );
      jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoriaAnexo] = jsonCategoria[categoriaAnexo];
      $('#jsonPastas').val(JSON.stringify(jsonPastas));
      return jsonPastas;
    } else {
      return jsonPastas;
    }
  }

  /**
   * Função genérica para verificar se uma pasta existe no Fluig e, caso não, criar.
   * @param {Integer} idPastaPai Código da pasta pai a ser buscada / criada.
   * @param {String} descricaoPastaFilha Descrição da pasta a ser buscada / criada.
   * @return {Null / Intger} Código da pasta criada.
   */
  static verificarCriarPasta(idPastaPai, descricaoPastaFilha, tipoVersionamento) {
    let codigoPastaEncontrada = FluigFile.buscarPasta(idPastaPai, descricaoPastaFilha);
    let codigoPastaCriada;
    if (Util.estaVazio(codigoPastaEncontrada)) {
      codigoPastaCriada = (FluigFile.criarPasta(idPastaPai, descricaoPastaFilha, tipoVersionamento)).content.documentId;
      if (Util.estaVazio(codigoPastaCriada)) {
        Util.exibirToast('Atenção!', `Erro ao criar pasta de descrição: ${descricaoPastaFilha}.`, 'danger');
        return null;
      }
      return codigoPastaCriada;
    } else {
      return codigoPastaEncontrada;
    }
  }

  static verificarEstruturaArquivoAnexado(jsonPastas, ...categorias) {
    let mensagemErro;
    if (Util.estaVazio(jsonPastas)) {
      return { erro: true, mensagem: '</br>Estrutura de pastas não encontrada.' };
    }
    if (Util.estaVazio(jsonPastas.pastaRaiz)) {
      return { erro: true, mensagem: '</br>Estrutura de pastas não encontrada.' };
    }
    if (Util.estaVazio(jsonPastas.pastaRaiz.filhos.pastaSolicitacao)) {
      return { erro: true, mensagem: '</br>Pasta da solicitação não encontrada.' };
    }
    if (Util.estaVazio(jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos)) {
      return { erro: true, mensagem: '</br>Não existem categorias criadas.' };
    }
    let categoriasComErro = [categorias]

    if (Util.estaVazio(jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categorias])) {
      categoriasComErro = categorias.filter(
        categoriaAtual =>
          Util.estaVazio(jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoriaAtual])
      );
    } else {
      for (let i = 0; i < jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categorias].arquivos.length; i++) {
        if (jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categorias].arquivos[i].ativo != 2) {
          categoriasComErro = categorias.filter(
            categoriaAtual =>
              Util.estaVazio(jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoriaAtual])
          );
        }
      }
    }
    if (categoriasComErro.length > 0) {
      mensagemErro = categoriasComErro.length == 1
        ? '</br>Não foram anexados arquivos para a seguinte categoria:'
        : '</br>A estrutura de pastas das seguintes categorias não foram criadas: ';
      mensagemErro += categoriasComErro.reduce((mensagem, elementoAtual) => { return mensagem + (FluigFile.formatarNomeCategoria(elementoAtual) + ', ') }, '');
      mensagemErro = mensagemErro.slice(0, -2);
      return { erro: true, mensagem: mensagemErro };
    } else {
      categoriasComErro = categorias.filter(
        categoriaAtual =>
          jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoriaAtual].arquivos.length < 1
      );
      if (categoriasComErro.length > 0) {
        mensagemErro = categoriasComErro.length == 1
          ? '</br>Não existe arquivo cadastrado no ECM para a seguinte categoria: '
          : '</br>Não existe arquivo cadastrado no ECM para as seguintes categorias: ';
        mensagemErro += categoriasComErro.reduce((mensagem, elementoAtual) => { return mensagem + (FluigFile.formatarNomeCategoria(elementoAtual) + ', ') }, '');
        mensagemErro = mensagemErro.slice(0, -2);
        return { erro: true, mensagem: mensagemErro };
      }
    }
    return { erro: false, mensagem: '' };
  }
}

class AcaoAnexo {
  static get ANEXAR() {
    return 0;
  }
  static get ANEXADO() {
    return 1;
  }
  static get EXCLUIR() {
    return 2;
  }
  static get VISUALIZAR() {
    return 3;
  }
}

class VersionOptions {
  static get MANTER_VERSAO() {
    return '0';
  }
  static get CRIAR_NOVA_REVISAO() {
    return '1';
  }
  static get CRIAR_NOVA_VERSAO() {
    return '2';
  }
}