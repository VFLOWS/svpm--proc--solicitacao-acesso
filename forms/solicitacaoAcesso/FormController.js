class FormController {
  constructor(activity, numProces, WKCardId, WKFormId, user, mobile, formMode) {
    this._atividade = activity;
    this._idProcesso = numProces;
    this._idCardForm = WKCardId;
    this._idForm = WKFormId;
    this._user = user;
    this._isMobile = mobile;
    this._formMode = formMode;
    this._fluigUtil = new Object({
      myComplete: new Object(),
      calendar: new Object()
    });

    this.autocomplete = {
      autoCompleteRazaoSocial: null
    };

    this.autocompleteProdutos = {}

    this.calendarios = {
      calendarioDataCorrecao: null,
      calendarioDataPreReuniao: null,
      calendarioDataReuniao: null,
    };

    this._activityController = new ActivityController(this._formMode, this._atividade);
    this._FormView = new FormView();
    this._loadForm();
  }

  /**
   * Método para carregar os eventos dos campos do formulário.
   */
  _loadForm() {

    var classes = new Array(
      "seTransferencia",
      "lancarInscricao",
      "divCredito",
      "divNecessitaSupervisor",
      // "receber",
      // "devolver",
      // "seCopiaCola",
      // "seBancoPix",
      // "seAleatoria",
      // "seEmail",
      // "seCelular",
      // "seCpfCnpj",
      // "seChavePix",
      // "sePix",
      // "seLancadoTotvs",
      // "seLancado",
      // "seMarcado",
    );

    this.exibirPaineisHistorico(classes);

    const formController = this;
    this._FormView.setFormController(formController);
    window['setSelectedZoomItem'] = !window['setSelectedZoomItem'] ? objZoom => this.zoomSelected(objZoom) : window['setSelectedZoomItem']();
    window['removedZoomItem'] = !window['removedZoomItem'] ? objZoom => this.zoomRemoved(objZoom) : window['removedZoomItem'];

    Util.contrairTodosCollapses();

    if (this._formMode == 'VIEW') {
      this._activityController._activityView[this._atividade](this._formMode, this._atividade, this._FormView, formController);
    } else {
      this._activityController._activityController[this._atividade](this._formMode, this._atividade, this._FormView, formController);
    }

    Util.expandirCollapsesDestacados();

    if (this._formMode == 'MOD') {
      if ($('#painelUltimaValidacao').val()) {
        this._FormView.mostrarModalValidacao($('#painelUltimaValidacao').val());
      }
    }
    this.setarMascaras();
  }

  /**
   * @function setarMascaras Adiciona máscara de reais nos campos que contém a classe.
   */
  setarMascaras() {
   /* if (this._atividade == Activity.INICIO_PADRAO || this._atividade == Activity.CORRIGIR || this._atividade == Activity.INICIO) {
      this.calendarios.calendarioDataRetornoViagem = Util.criarCalendario('divDataRetornoViagem');
      this.calendarios.calendarioDataInicioViagem = Util.criarCalendario('divDataInicioViagem');
    }
    if (this._atividade == Activity.REVISAR_CADASTRO) {
      this.calendarios.calendarioDataCorrecao = Util.criarCalendario('divDataCorrecaoRevisao');
    }*/
    

    var behavior = function (val) {
      return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
    },
      options = {
        onKeyPress: function (val, e, field, options) {
          field.mask(behavior.apply({}, arguments), options);
        }
      };

    $('.phone').mask(behavior, options);

    $('.real').mask("#.##0,00", { reverse: true });

    $('.data').mask('99/99/9999');

    $('.cnpj').mask('00.000.000/0000-00', { reverse: true });
  }

  atualizaValorDiarias() {
    $('#valorDiaria, #quantidade').on('keyup', function () {
      const valorDiariaFloat = $('#valorDiaria').val() ? Util.converterReaisEmFloat($('#valorDiaria').val()) : 0;
      const quantidadeMensalidades = $("#quantidade").val() ? parseInt($("#quantidade").val()) : 0

      $("#valorTotal").val(
        (valorDiariaFloat * quantidadeMensalidades).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace('R$ ', '')
      )
    })
  }

  anexarListaArquivos(elementoDOM, categoria, idListaHtml) {
    FluigFile.anexarArquivo(elementoDOM, categoria, (elementoDOM) => {
      const botaoDOM = $(elementoDOM).parent().find('.btn');
      $(botaoDOM).removeClass('btn-danger');
      $(botaoDOM).addClass('btn-info');
      this.atualizarListaCategoria(idListaHtml, categoria);
    });
  }

  anexarListaArquivosComCheckbox(elementoDOM, categoria, idListaHtml) {
    FluigFile.anexarArquivo(elementoDOM, categoria, (elementoDOM) => {
      const botaoDOM = $(elementoDOM).parent().find('.btn');
      $(botaoDOM).removeClass('btn-danger');
      $(botaoDOM).addClass('btn-info');
      this.atualizarListaCategoriaComCheckbox(idListaHtml, categoria);
    });
  }

  controlarBotoesAnexo(elementoDOM, acao, categoria) {
    if (acao == AcaoAnexo.ANEXAR) {
      this.anexarArquivo(elementoDOM, categoria);
    }
    if (acao == AcaoAnexo.VISUALIZAR) {
      if (categoria == 'solicitacao') {
        this.visualizarPastaSolicitacao();
      } else {
        this.visualizarArquivoCategoria(elementoDOM, categoria);
      }
    }
    if (acao == AcaoAnexo.EXCLUIR) {
      this.excluirArquivo(elementoDOM, categoria);
    }
  }

  getItemLista(idArquivo, nomeArquivo, idListaHtml, categoria) {
    return Mustache.render($('#templateItemLista').html(), {
      nomeArquivo: nomeArquivo,
      idArquivo: idArquivo,
      idListaHtml: idListaHtml,
      categoria: categoria
    });
  }

  getItemListaComCheckbox(idArquivo, nomeArquivo, idListaHtml, categoria) {
    return Mustache.render($('#templateItemListaComCheckbox').html(), {
      nomeArquivo: nomeArquivo,
      idArquivo: idArquivo,
      idListaHtml: idListaHtml,
      categoria: categoria
    });
  }


  limparListaArquivos(idListaHtml) {
    $(`${idListaHtml[0] == '#' ? idListaHtml : `#${idListaHtml}`} > li > .btn-danger`).click()
  }

  bloquearExclusaoArquivosJaAnexados(categoria) {
    let jsonPastas = JSON.parse($('#jsonPastas').val());
    if (!Util.estaVazio(jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria])) {
      let arquivosBloqueados = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos
        .map(arquivo => {
          if (arquivo.ativo == 1) {
            arquivo.ativo = 2;
          }
          return arquivo;
        });
      jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos = arquivosBloqueados;
      $('#jsonPastas').val(JSON.stringify(jsonPastas));
    }
  }

  visualizarArquivoLista(idArquivo) {
    const url = FluigFile.obterUrlArquivo(idArquivo);
    window.open(url, '_blank');
  }

  adicionarArquivoNaCategoria(idArquivo, categoriaDestino) {
    let jsonPastas = JSON.parse($('#jsonPastas').val());

    // Localiza o arquivo em qualquer categoria
    const todasCategorias = Object.keys(jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos);
    let arquivoOriginal = null;

    for (const cat of todasCategorias) {
      const encontrado = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[cat].arquivos
        .find(a => a.id == idArquivo);
      if (encontrado) {
        arquivoOriginal = encontrado;
        break;
      }
    }

    if (!arquivoOriginal) return;

    // Garante que a categoria destino existe
    if (!jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoriaDestino]) {
      jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoriaDestino] = { arquivos: [] };
    }

    // Evita duplicar
    const jaExiste = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoriaDestino].arquivos
      .some(a => a.id == idArquivo);
    if (!jaExiste) {
      jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoriaDestino].arquivos.push(arquivoOriginal);
    }

    $('#jsonPastas').val(JSON.stringify(jsonPastas));
  }




  removerArquivoLista(idArquivoRemovido, idListaHtml, categoria) {
    let jsonPastas = JSON.parse($('#jsonPastas').val());
    let indexArquivoRemovido = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos
      .findIndex(arquivo => arquivo.id == idArquivoRemovido);
    if (jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos[indexArquivoRemovido].ativo == 1) {
      this.desativarArquivoCategoria(jsonPastas, indexArquivoRemovido, categoria);
    } else {
      this.deletarArquivoCategoria(jsonPastas, indexArquivoRemovido, idArquivoRemovido, categoria);
    }
    this.atualizarListaCategoria(idListaHtml, categoria);

    FluigFile.verificarExclusaoPastasEmCadeia(jsonPastas, categoria);
  }

  desativarArquivoCategoria(jsonPastas, indexArquivoRemovido, categoria) {
    jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos[indexArquivoRemovido].ativo = 2;
    $('#jsonPastas').val(JSON.stringify(jsonPastas));
    Util.exibirToast('OK!', 'Arquivo excluído com sucesso.', 'success');
  }

  deletarArquivoCategoria(jsonPastas, indexArquivoRemovido, idArquivo, categoria) {
    let resultadoRequisicao = FluigFile.excluirArquivoPasta(idArquivo);
    if (resultadoRequisicao) {
      jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos.splice(indexArquivoRemovido, 1);
      $('#jsonPastas').val(JSON.stringify(jsonPastas));
    } else {
      Util.exibirToast(`Erro ao remover o documento.`, '', 'danger');
    }
  }

  atualizarListaCategoria(idListaHtml, categoria, apenasSelecionados = null) {
    let jsonPastas = JSON.parse($('#jsonPastas').val());

    if (jsonPastas.pastaRaiz != 'undefined' && jsonPastas.pastaRaiz != undefined) {
      if (!Util.estaVazio(jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria])) {
        let arquivosCotacoesAtivos = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos
          .filter(arquivo => arquivo.ativo != 2);

        // Só pega os valores dos checkboxes se for para filtrar
        let idsSelecionados = [];
        if (apenasSelecionados !== null) {
          idsSelecionados = $("input[name='docSelecionado']:checked")
            .map(function () { return $(this).val(); }).get();
        }

        if (apenasSelecionados === true) {
          // Apenas arquivos selecionados (checkbox marcados)
          arquivosCotacoesAtivos = arquivosCotacoesAtivos.filter(arquivo =>
            idsSelecionados.includes(String(arquivo.id))
          );
        } else if (apenasSelecionados === false) {
          // Apenas arquivos não selecionados (checkbox desmarcados)
          arquivosCotacoesAtivos = arquivosCotacoesAtivos.filter(arquivo =>
            !idsSelecionados.includes(String(arquivo.id))
          );
        }

        $(`#${idListaHtml}`).html('');
        arquivosCotacoesAtivos.forEach((arquivo) => {
          $(`#${idListaHtml}`).append(this.getItemLista(arquivo.id, arquivo.nome, idListaHtml, categoria));
        });
      }
    }
  }

  atualizarListaCategoriaComCheckbox(idListaHtml, categoria, apenasSelecionados = null) {
    let jsonPastas = JSON.parse($('#jsonPastas').val());

    if (jsonPastas.pastaRaiz != 'undefined' && jsonPastas.pastaRaiz != undefined) {
      if (!Util.estaVazio(jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria])) {
        let arquivosCotacoesAtivos = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos
          .filter(arquivo => arquivo.ativo != 2);

        // Só pega os valores dos checkboxes se for para filtrar
        let idsSelecionados = [];
        if (apenasSelecionados !== null) {
          idsSelecionados = $("input[name='docSelecionado']:checked")
            .map(function () { return $(this).val(); }).get();
        }

        if (apenasSelecionados === true) {
          // Apenas arquivos selecionados (checkbox marcados)
          arquivosCotacoesAtivos = arquivosCotacoesAtivos.filter(arquivo =>
            idsSelecionados.includes(String(arquivo.id))
          );
        } else if (apenasSelecionados === false) {
          // Apenas arquivos não selecionados (checkbox desmarcados)
          arquivosCotacoesAtivos = arquivosCotacoesAtivos.filter(arquivo =>
            !idsSelecionados.includes(String(arquivo.id))
          );
        }

        $(`#${idListaHtml}`).html('');
        arquivosCotacoesAtivos.forEach((arquivo) => {
          $(`#${idListaHtml}`).append(this.getItemListaComCheckbox(arquivo.id, arquivo.nome, idListaHtml, categoria));
        });
      }
    }
  }


  anexarArquivo(elementoDOM, categoria) {
    FluigFile.anexarArquivo(elementoDOM, categoria, (elementoDOM) => {
      // Alterna botões para não anexar mais arquivos e permitir visualização e exclusão
      const id = elementoDOM.id;
      const idSpanAnexo = $(`#${id}`).parent()[0].id;
      // Habilita os botões de visualizar e excluir anexo
      $(`#${idSpanAnexo}`).parents().eq(1).find('button').each(function () {
        Util.desabilitarCampos([`#${this.id}`], false);
      });
      // Desabilita o botão de anexar
      Util.desabilitarCampos([`#${id}`, `#${idSpanAnexo}`]);
    });
  }

  visualizarArquivoCategoria(elemento = null, categoria) {
    let id = this.obterIdUltimoArquivo(categoria);
    if (!Util.estaVazio(id)) {
      const url = FluigFile.obterUrlArquivo(id);
      window.open(url, '_blank');
    } else {
      Util.exibirToast('Atenção!', 'Falha ao encontrar o ID do arquivo no ECM.', 'danger');
    }
  }

  visualizarPastaSolicitacao() {
    let id = this.obterIdPastaSolicitacao();
    if (!Util.estaVazio(id)) {
      const url = FluigFile.obterUrlArquivo(id);
      window.open(url, '_blank');
    } else {
      Util.exibirToast('Atenção!', 'Falha ao encontrar o ID do arquivo no ECM.', 'danger');
    }
  }

  obterIdPastaSolicitacao() {
    let id = null;
    const jsonPastas = JSON.parse($('#jsonPastas').val());
    if (!Util.estaVazio(jsonPastas)) {
      if (jsonPastas.pastaRaiz.filhos.pastaSolicitacao.hasOwnProperty('id')) {
        id = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.id;
      } else {
        Util.exibirToast('Atenção!', 'Pasta da solicitação não foi criada.', 'danger');
      }
    } else {
      Util.exibirToast('Atenção!', 'A referência da pasta não foi encontrada, estrutura de arquivos não definida.', 'danger');
    }
    return id;
  }

  /**
  * Método para obter o id do último arquivo salvo na solicitação relacionado a categoria informada.
  *
  * @param {*} categoria
  */
  obterIdUltimoArquivo(categoria) {
    let id = null;
    if (!Util.estaVazio(categoria)) {
      const jsonPastas = JSON.parse($('#jsonPastas').val());
      if (jsonPastas.pastaRaiz.filhos.pastaSolicitacao.hasOwnProperty('id')) {
        const arquivos = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos;
        if (arquivos.length) {
          arquivos.forEach((arquivo, index) => {
            if (index == 0 || (index > 0 && id < arquivo.id)) {
              id = arquivo.id;
            }
          });
        } else {
          Util.exibirToast('Atenção!', `Nenhum arquivo relacionado a categoria de ${FluigFile.formatarNomeCategoria(categoria)} foi encontrado.`, 'danger');
        }
      } else {
        Util.exibirToast('Atenção!', 'Nenhum arquivo relacionado a esta solicitação foi encontrado.', 'danger');
      }
    } else {
      Util.exibirToast('Atenção!', 'A referência do arquivo não foi encontrada, a categoria não está definida.', 'danger');
    }
    return id;
  }

  /**
    * Método para obter o id do último arquivo salvo no histórico relacionado a categoria informada.
    *
    * @param {*} jsonPastasVal
    * @param {*} categoria
    */
  obterIdUltimoArquivoHistorico(jsonPastasVal, categoria) {
    let id = null;
    
    if (!Util.estaVazio(categoria)) {
        try {
            const jsonPastas = jsonPastasVal ? JSON.parse(jsonPastasVal) : {};
            
            // Verificação defensiva completa da estrutura
            if (jsonPastas?.pastaRaiz?.filhos?.pastaSolicitacao?.filhos?.[categoria]?.arquivos) {
                const arquivos = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos;
                
                if (arquivos.length) {
                    arquivos.forEach((arquivo) => {
                        if (arquivo.id && (!id || arquivo.id > id)) {
                            id = arquivo.id;
                        }
                    });
                } else {
                    Util.exibirToast('Atenção!', `Nenhum arquivo na categoria ${categoria}.`, 'warning');
                }
            } else {
                Util.exibirToast('Atenção!', `Estrutura de pastas inválida para ${categoria}.`, 'danger');
            }
        } catch (e) {
            Util.exibirToast('Erro!', 'Falha ao processar histórico de arquivos.', 'danger');
            console.error("Erro no obterIdUltimoArquivoHistorico:", e);
        }
    }
    return id;
}

  /**
  * Método para excluir arquivo do fluig relacionado a categoria informada.
  *
  * @param {*} elemento
  * @param {*} categoria
  */
  excluirArquivo(elemento, categoria) {
    let id = this.obterIdUltimoArquivo(categoria);
    if (!Util.estaVazio(id)) {

      var jsonPastas = JSON.parse($('#jsonPastas').val());
      let arquivos = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos;
      var arquivoAtivo = 0;
      var index = "";

      if (arquivos.length) {
        arquivos.forEach((arq, idx) => {
          if (arq["id"] == id) {
            if (arq["ativo"] == 1) {
              index = idx;
              arquivoAtivo = 1;
            }
          }
        })

        if (arquivoAtivo == 1) {
          jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos[index]["ativo"] = 2;
          $('#jsonPastas').val(JSON.stringify(jsonPastas));

          // Habilita o botão de anexar
          let idSpanAnexar = $(elemento).parent().parent().find('.file-input-wrapper')[0].id
          let idInputAnexar = $(elemento).parent().parent().find('.file-input-wrapper > input')[0].id;
          Util.desabilitarCampos([`#${idInputAnexar}`, `#${idSpanAnexar}`], false);

          // Desabilita os botões de visualizar e excluir anexo
          $(`#${elemento.id}`).parents().eq(1).find('button').each(function () {
            Util.desabilitarCampos([`#${this.id}`]);
          })
        } else {
          const arquivoFoiExcluido = FluigFile.excluirArquivoPasta(id);
          if (arquivoFoiExcluido) {
            let arquivos = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos;
            if (arquivos.length) {
              arquivos = arquivos.filter(arquivo => id != arquivo.id);
              jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos = arquivos;
              $('#jsonPastas').val(JSON.stringify(jsonPastas));
              // Habilita o botão de anexar
              let idSpanAnexar = $(elemento).parent().parent().find('.file-input-wrapper')[0].id
              let idInputAnexar = $(elemento).parent().parent().find('.file-input-wrapper > input')[0].id;
              Util.desabilitarCampos([`#${idInputAnexar}`, `#${idSpanAnexar}`], false);

              // Desabilita os botões de visualizar e excluir anexo
              $(`#${elemento.id}`).parents().eq(1).find('button').each(function () {
                Util.desabilitarCampos([`#${this.id}`]);
              });
            }
          }
        }
      }
    } else {
      Util.exibirToast('Atenção!', 'Falha ao encontrar o ID do arquivo no ECM.', 'danger');
    }
  }

  atualizarListaCategoriaHist(idListaHtml, categoria, jsonPastasHist) {
    let jsonPastas = JSON.parse(jsonPastasHist);
    if (jsonPastas.pastaRaiz != 'undefined' && jsonPastas.pastaRaiz != undefined) {
      if (!Util.estaVazio(jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria])) {
        let arquivosCotacoesAtivos = jsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos[categoria].arquivos
          .filter(arquivo => arquivo.ativo != 2);
        $(`#${idListaHtml}`).html('');
        arquivosCotacoesAtivos.map((arquivo, index) => {
          $(`#${idListaHtml}`).append(this.getItemLista(arquivo.id, arquivo.nome, idListaHtml, categoria));
        });
      }
    }
  }

  mostrarBloquearAnexo(idBotaoAnexo, idListaHtml) {
    if ($(`${idListaHtml[0] === '#' ? idListaHtml : '#' + idListaHtml} > li`).length > 0) {
      $(`${idBotaoAnexo[0] === '#' ? idBotaoAnexo : '#' + idBotaoAnexo}`).parent().parent().show();
      $(`${idListaHtml[0] === '#' ? idListaHtml : '#' + idListaHtml} > li > .btn-danger`).hide();
      $(`${idBotaoAnexo[0] === '#' ? idBotaoAnexo : '#' + idBotaoAnexo}`).parent().hide();
      $(`${idBotaoAnexo[0] === '#' ? idBotaoAnexo : '#' + idBotaoAnexo}`).parent().parent().find('.col-md-10').addClass('col-md-12').removeClass('col-md-10');
    } else {
      $(`${idBotaoAnexo[0] === '#' ? idBotaoAnexo : '#' + idBotaoAnexo}`).parent().parent().hide();
    }
  }

  visualizarArquivoCategoriaHistorico(jsonPastas, categoria) {
    try {
        const id = this.obterIdUltimoArquivoHistorico(jsonPastas, categoria);
        
        if (id) {
            const url = FluigFile.obterUrlArquivo(id);
            if (url) {
                window.open(url, '_blank');
            } else {
                Util.exibirToast('Erro!', 'URL do arquivo não encontrada.', 'danger');
            }
        }
    } catch (e) {
        Util.exibirToast('Erro!', 'Falha ao visualizar arquivo.', 'danger');
        console.error("Erro no visualizarArquivoCategoriaHistorico:", e);
    }
}
  /**
   * @function acoesRadio Define as ações acionadas para cada opção de aprovação do gestor, mostrando ou ocultando campos.
   * 
   * @param {Radio} input elemento radio button de aprovação.
   */
  acoesRadio(input) {
    $(input).parent().parent().parent().find('input[type=hidden]').val(input.value);
  }

  /**  ====================      ZOOM      ====================  */
  /**
   * Método para realizar ações ao selecionar um item num campo zoom.
   *
   * @param {Object} selectedItem
   */
  zoomSelected(selectedItem) {
    Util.carregamento(() => {
      const idSelecionado = selectedItem.inputId;
      this.zoomPainelSolicitacao(idSelecionado, selectedItem, AcaoZoom.SELECIONADO);
    });
  }

  /**
   * Método para realizar ações ao remover um item de um campo zoom.
   *
   * @param {Object} removedItem
   */
  zoomRemoved(removedItem) {
    Util.carregamento(() => {
      const idSelecionado = removedItem.inputId;
      this.zoomPainelSolicitacao(idSelecionado, removedItem, AcaoZoom.REMOVIDO);
    });
  }

  zoomPainelSolicitacao(idSelecionado, zoomItem, acaoZoom) {
    const solicitacaoCNPJContratoRM = "solicitacaoCNPJContratoRM";
    const solicitacaoNumProcessoAdm = "descricaoProcessoAdm";
    const itemContrato = "itemContrato";
    const nomeBanco = "nomeBanco";
    const searchUnidadeOrganizacional = "searchUnidadeOrganizacional";
    const searchCentroCustoDadosContrato = "searchCentroCustoDadosContrato";
    const nomeBancoPix = "nomeBancoPix";
    if (acaoZoom == AcaoZoom.SELECIONADO) {
      if (idSelecionado == "zoom_estado") {
        $("#codEstado").val(zoomItem["CODIGO"]);
      }

      if (idSelecionado == "banco") {
        $("#cod_banco").val(zoomItem["codigoSisbacen"]);
      }
      
      if (idSelecionado == "zoom_cidade") {
        $("#codCidade").val(zoomItem["CC2_CODMUN"]);
      }
      
      if (idSelecionado == "conta_contabil") {
        $("#cod_conta_contabil").val(zoomItem["CT1_CONTA"]);
      }
      
      if (idSelecionado == "forma_pagamento") {
        $("#cod_forma_pagamento").val(zoomItem["X5_CHAVE"]);
      }
      
      if (idSelecionado == solicitacaoCNPJContratoRM) {
        this.verificarJaPossuiPagamentoNotaFiscal();
        if (zoomItem["NUMPROCADM"] != '') {
          const retorno = this.carregarProcessoAdministrativo(zoomItem["NUMPROCADM"]);
          $('#solicitacaoModalideContratoRM').val(zoomItem["NOME"]);
          $('#solicitacaoNomeContratoRM').val(zoomItem["RZASOCIAL"]);
          $('#solicitacaoContratoCodColigada').val(zoomItem["CODCOLIGADA"]);
          $('#solicitacaoContratoCodigo').val(zoomItem["CODIGOCONTRATO"]);
          $('#solicitacaoContratoCODCFO').val(zoomItem["CODCFO"]);
          $('#solicitacaoContratoCCusto').val(zoomItem["CODCCUSTO"]);
          $('#solicitacaoCentroCustoFornecedor').val(zoomItem["NOMEFANTASIA"]);
          $('#solicitacaoRMContrato').val(zoomItem["CODIGOCONTRATO"]);
        } else {
          Util.exibirToast('Atenção!', 'Contrato selecionado não possui Processo Administrativo informado no TOTVS RM. Favor verificar.', 'danger')
        }
      }

      if (idSelecionado == searchUnidadeOrganizacional) {
        $('#solicitacaoCodigoEntidadeResp').val(zoomItem["CODENTIDADE"]);
        $('#solicitacaoCodigoUnidadeResp').val(zoomItem["CODUNIDADEORGANIZACIONAL"]);
        $('#solicitacaoDescricaoUnidade').val(zoomItem["NOMEUNIDADEORGANIZACIONAL"]);

        window['searchCentroCustoDadosContrato'].disable(false);
        this.carregarCentroDeCusto(zoomItem["CODENTIDADE"], zoomItem["CODUNIDADEORGANIZACIONAL"]);
      }

      if (idSelecionado == searchCentroCustoDadosContrato) {
        $('#codigoCentroCusto, #solicitacaoCodCusto').val(zoomItem["CODCCUSTO"]);
        $('#solicitacaoLoginGerenteCC').val(zoomItem["LOGINRMGERENTE"]);
        $('#codigoEntidadeCCusto').val(zoomItem["CODENTIDADE"]);
        $('#solicitacaoLoginGerenteGeralCC').val(zoomItem["LOGINRMGERENTEGERAL"]);
        $('#solicitacaoDescCusto').val(zoomItem["DESC_CCUSTO"]);

        var g1 = DatasetFactory.createConstraint("login", zoomItem["LOGINRMGERENTE"], zoomItem["LOGINRMGERENTE"], ConstraintType.MUST);
        var constraintsg1 = new Array(g1);
        var gerente_mat = DatasetFactory.getDataset("colleague", null, constraintsg1, null);
        $("#solicitacaoIdGerenteCC").val(gerente_mat.values[0]["colleaguePK.colleagueId"]);

        var g1 = DatasetFactory.createConstraint("login", zoomItem["LOGINRMGERENTEGERAL"], zoomItem["LOGINRMGERENTEGERAL"], ConstraintType.MUST);
        var constraintsg1 = new Array(g1);
        var gerente_geral_mat = DatasetFactory.getDataset("colleague", null, constraintsg1, null);
        $("#solicitacaoIdGerenteGeralCC").val(gerente_geral_mat.values[0]["colleaguePK.colleagueId"]);
      }

      if (idSelecionado == solicitacaoNumProcessoAdm) {
        $('#solicitacaoIdDocProcessoAdm').val(zoomItem["documentid"])
        $('#jsonPastasProcessoAdm').val(zoomItem["jsonPastas"])
        $('#jsonSolicitacoesProcessoAdm').val(zoomItem["jsonSolicitacoes"])
        $('#numProcessoAdm').val(zoomItem["numeroProcesso"])
        $('#painelSolicitacaoDadosPagto').show()
      }

      if (idSelecionado.includes(itemContrato)) {
        const posicaoTabela = idSelecionado.split('___')[1];
        const ID_TABELA = 'tableAdicionarItem';
        const idCampo = `itemContratoSeq`;
        const valorCampo = zoomItem['NUMEROSEQUENCIAL'];
        const tipoMedicao = zoomItem['TIPOMEDICAO'];
        $(`#tipoMedicaoContratoHidden___${posicaoTabela}`).val(tipoMedicao)

        $(`#${idCampo}___${posicaoTabela}`).val(zoomItem['NUMEROSEQUENCIAL'])

        const cCentroCusto = DatasetFactory.createConstraint('CODCCUSTO', zoomItem['CODCCUSTO'], zoomItem['CODCCUSTO'], ConstraintType.MUST);
        const dsCentroCusto = DatasetFactory.getDataset('dsConsultaCentroCustoUsuarioCompras_wsConsultaSQL', [], [cCentroCusto], null).values[0];

        $('#unidadeItem___' + posicaoTabela).val(dsCentroCusto['NOMEUNIDADEORGANIZACIONAL']);
        $('#descricaoCentroCustoItem___' + posicaoTabela).val(dsCentroCusto['DESC_CCUSTO']);
        $('#codigoCentroCustoItem___' + posicaoTabela).val(dsCentroCusto['CODCCUSTO']);
        $('#quantidade___' + posicaoTabela).val(Number(zoomItem['QUANTIDADE']));

        const quantidade = zoomItem['QUANTIDADE'];
        const valorUnitario = zoomItem['PRECO'];

        const resultadoBusca = Util.buscarItemJaSelecionadoTabela(ID_TABELA, idCampo, valorCampo);
        if (resultadoBusca) {
          Util.exibirToast('Atenção: ', 'Não é possível adicionar dois itens de contrato na mesma categoria', 'warning');
          window[idSelecionado].clear();
          $(`#${idCampo}___${posicaoTabela}`).val('');
          $(`#itemContrato___${posicaoTabela}`).val('');
          $('#unidadeItem___' + posicaoTabela).val('');
          $(`#codigoCentroCustoItem___${posicaoTabela}`).val('');
          $('#descricaoCentroCustoItem___' + posicaoTabela).val('');
          $('#quantidade___' + posicaoTabela).val('');
          $('#valorUnitario___' + posicaoTabela).val('');
          $('#valorTotal___' + posicaoTabela).val('');
        }
        else {
          this.carregaFuncionalidadesTabela(quantidade, valorUnitario, posicaoTabela);
        }
      }

      if (idSelecionado == nomeBanco) {
        $('#codigoBancoHidden').val(zoomItem["NUMEROOFICIAL"]);
      }

      if (idSelecionado == nomeBancoPix) {
        $('#codigoBancoPixHidden').val(zoomItem["NUMEROOFICIAL"]);
      }

    } else if (acaoZoom == AcaoZoom.REMOVIDO) {
      if (idSelecionado == "zoom_estado") {
        $("#codEstado").val("");
      }
      
      if (idSelecionado == "zoom_cidade") {
        $("#codCidade").val("");
      }
      
      if (idSelecionado == "conta_contabil") {
        $("#cod_conta_contabil").val("");
      }
      
      if (idSelecionado == "forma_pagamento") {
        $("#cod_forma_pagamento").val("");
      }

      if (idSelecionado == "banco") {
        $("#cod_banco").val("");
      }
      
      if (idSelecionado == solicitacaoCNPJContratoRM) {

        /**Exclui todas as linhas da tabela */
        $('.fluigicon-trash').not(':first').click()

        /**Limpa os valores */
        $('#solicitacaoModalideContratoRM').val('');
        $('#solicitacaoNomeContratoRM').val('');
        $('#solicitacaoContratoCodColigada').val('');
        $('#solicitacaoContratoCodigo').val('');
        $('#solicitacaoContratoCODCFO').val('');
        $('#solicitacaoContratoCCusto').val('');
        $('#solicitacaoRMContrato').val('');
        $('#codigoCentroCusto').val('');
        $('#solicitacaoCodCusto').val('');
        $('#solicitacaoLoginGerenteCC').val('');
        $('#solicitacaoIdGerenteCC').val('');
        $('#solicitacaoLoginGerenteGeralCC').val('');
        $('#solicitacaoIdGerenteGeralCC').val('');
        $('#solicitacaoDescCusto').val('');
        $('#solicitacaoCodigoEntidadeResp').val('');
        $('#solicitacaoCodigoUnidadeResp').val('');
        $('#solicitacaoDescricaoUnidade').val('');
        $('#descricaoProcessoAdm').val('');
        $("#valorNotaFiscal").val('');
        $("#valorTotalNotaFiscal").val('');
        $("#dataProgramadaPgmento").val('');
        $("#numeroNotaFiscal").val('');
        $("#dadosPagamentoObs").val('');
        $("#nomeBanco").val('');
        $("#agenciaBancaria").val('');
        $("#contaCorrente").val('');

        /**Tira todos os Checks */
        $("[id^='debitoReceitaFederal']").prop("checked", false);
        $("[id^='formaPagamento']").prop("checked", false);
        $("[id^='dadosFornCorretos']").prop("checked", false);
        $("[id^='dadosSescoopCorretos']").prop("checked", false);
        $("[id^='valorIndicadoCorreto']").prop("checked", false);
        $("[id^='dataPagamentoCorreta']").prop("checked", false);
        $("[id^='validadeBoleto10Dias']").prop("checked", false);
        $("[id^='tipoConta']").prop("checked", false);
        $("[id^='fornOptanteSimples']").prop("checked", false);
        $("[id^='notaFiscalItensConferidos']").prop("checked", false);
        $("[id^='danfeItensConferidos']").prop("checked", false);
        $("[id^='fgts']").prop("checked", false);
        $("[id^='debitoReceitaFederal']").prop("checked", false);
        $("[id^='documentosCondicoes']").prop("checked", false);

        /**Esconde todas as classes abertas */
        $(".fgts").hide();
        $(".seTransferencia").hide();
        $(".seBoleto").hide();
        $(".fornOptanteSimples").hide();
        $(".notaFiscalItensConferidos").hide();
        $(".debitoReceitaFederal").hide();
        $(".danfeAnexos").hide();
        $(".documentosCondicoes").hide();

        /**Tira as tags dos zooms */
        window["nomeBanco"].clear()
        window["searchUnidadeOrganizacional"].clear()
        window["searchCentroCustoDadosContrato"].clear()

        /**Exclui todos os anexos */
        if (Util.estaVazio($("#excluirBoleto").attr("disabled"))) {
          $("#excluirBoleto").click();
        }

        if (Util.estaVazio($("#excluirFGTS").attr("disabled"))) {
          $("#excluirFGTS").click();
        }

        if (Util.estaVazio($("#excluirDebitoReceitaFederal").attr("disabled"))) {
          $("#excluirDebitoReceitaFederal").click();
        }

        if (Util.estaVazio($("#excluirDeclaracao").attr("disabled"))) {
          $("#excluirDeclaracao").click();
        }

        if (Util.estaVazio($("#excluirNotaFiscal").attr("disabled"))) {
          $("#excluirNotaFiscal").click();
        }

        if (Util.estaVazio($("#excluirDanfe").attr("disabled"))) {
          $("#excluirDanfe").click();
        }

        setTimeout(() => {
          $($('#solicitacaoCNPJContratoRM').parent().find('input')[0]).mask('00.000.000/0000-00');
        }, 500);
        this.carregarCentroDeCusto();
      }

      if (idSelecionado == searchUnidadeOrganizacional) {
        $('#codigoEntidade').val("");
        $('#codigoUnidadeOrg').val("");
        $('#nomeUnidadeOrg').val("");
        $('#codigoCentroCusto, #solicitacaoCodCusto').val("");
        this.carregarCentroDeCusto();
      }

      if (idSelecionado == searchCentroCustoDadosContrato) {
        $('#codigoCentroCusto, #solicitacaoCodCusto').val("");
        $('#solicitacaoLoginGerenteCC').val("");
        $('#codigoEntidadeCCusto').val("");
        $('#solicitacaoLoginGerenteGeralCC').val("");
        $('#solicitacaoDescCusto').val("");
      }

      if (idSelecionado == solicitacaoNumProcessoAdm) {
        $('#codigoCentroCusto, #solicitacaoCodCusto').val("");
        $('#solicitacaoLoginGerenteCC').val("");
        $('#codigoEntidadeCCusto').val("");
        $('#solicitacaoLoginGerenteGeralCC').val("");
        $('#solicitacaoDescCusto').val("");
      }


      if (idSelecionado.includes(itemContrato)) {
        const posicaoTabela = idSelecionado.split('___')[1];
        $(`#itemContrato___${posicaoTabela}`).val('');
        $('#unidadeItem___' + posicaoTabela).val('');
        $(`#descricaoCentroCustoItem___${posicaoTabela}`).val('');
        $('#codigoCentroCustoItem___' + posicaoTabela).val('');
        $('#quantidade___' + posicaoTabela).val('');
        $('#valorUnitario___' + posicaoTabela).val('');
        $('#valorTotal___' + posicaoTabela).val('');
        $("#valorNotaFiscal").val('');
        $("#valorTotalNotaFiscal").val('');
        this.limparRecarregarItensContrato(posicaoTabela);
      }

      if (idSelecionado == nomeBanco) {
        $('#codigoBancoHidden').val('');
      }

      if (idSelecionado == nomeBancoPix) {
        $('#codigoBancoPixHidden').val('');
      }

    }
  }

  limparRecarregarItensContrato(index) {
    const numeroContrato = $("#solicitacaoContratoCodigo").val();
    const coligada = $('#solicitacaoContratoCodColigada').val();

    reloadZoomFilterValues(`itemContrato___${index}`, `parameters,CODCOLIGADA=${coligada};CODCONTRATO=${numeroContrato}`);
  }

  carregarProcessoAdministrativo(codigo) {

    let cNumeroProcesso = DatasetFactory.createConstraint('numeroProcesso', codigo, codigo, ConstraintType.MUST);
    let cActive = DatasetFactory.createConstraint('metadata#active', 'true', 'true', ConstraintType.MUST);
    const datasetun = DatasetFactory.getDataset('DSformProcessoAdministrativo', null, [cActive, cNumeroProcesso], null);

    if (datasetun.values.length > 0) {
      const selectedItem = {
        id: datasetun.values[0].descricaoProcesso,
        inputId: 'descricaoProcessoAdm',
        inputName: 'descricaoProcessoAdm',
        selected: true,
        dataSize: 1,
        text: datasetun.values[0].descricaoProcesso,
        documentid: datasetun.values[0].documentid,
        jsonPastas: datasetun.values[0].jsonPastas,
        jsonSolicitacoes: datasetun.values[0][datasetun.values[0].refJsonSolicitacoes],
        refJsonSolicitacoes: datasetun.values[0].refJsonSolicitacoes,
        numeroProcesso: codigo
      }
      setSelectedZoomItem(selectedItem)

      $('#descricaoProcessoAdm').val(datasetun.values[0].descricaoProcesso);
      return [true, datasetun.values[0]]

    } else {
      return [false, '']
    }

  }


  carregarUnidadeOrganizacional(entidade, unidade, matricula) {
    //matricula = !Util.estaVazio(matricula) ? matricula : $('#loginSolicitante').val();
    matricula = !Util.estaVazio(matricula) ? matricula : $("loginSolicitante").val() == 'eduardo.totvs' ? 'nilton.araruna' : $("loginSolicitante").val();
    let cLogin = DatasetFactory.createConstraint("LOGIN", matricula, matricula, ConstraintType.MUST);
    let arrayConstraints = new Array(cLogin);
    let filter = `LOGIN,${matricula}`

    if (!Util.estaVazio(entidade)) {
      let cCodigoEntidade = DatasetFactory.createConstraint("CODENTIDADE", entidade, entidade, ConstraintType.MUST);
      arrayConstraints.push(cCodigoEntidade)
      filter += `,CODENTIDADE,${entidade}`
    }

    if (!Util.estaVazio(unidade)) {
      let cCodigoUnidadeOrg = DatasetFactory.createConstraint('CODUNIDADEORGANIZACIONAL', unidade, unidade, ConstraintType.MUST);
      arrayConstraints.push(cCodigoUnidadeOrg)
      filter += `,CODUNIDADEORGANIZACIONAL,${unidade}`
      const datasetun = DatasetFactory.getDataset('dsConsultaUnidadeOrganizacional_wsConsultaSQLRM', null, arrayConstraints, null);
      if (datasetun.values.length > 0) {
        const selectedItem = {
          id: datasetun.values[0].NOMEUNIDADEORGANIZACIONAL,
          inputId: 'searchUnidadeOrganizacional',
          inputName: 'searchUnidadeOrganizacional',
          selected: true,
          dataSize: 1,
          text: datasetun.values[0].NOMEUNIDADEORGANIZACIONAL,
          CODENTIDADE: datasetun.values[0].CODENTIDADE,
          CODUNIDADEORGANIZACIONAL: datasetun.values[0].CODUNIDADEORGANIZACIONAL,
          NOMEUNIDADEORGANIZACIONAL: datasetun.values[0].NOMEUNIDADEORGANIZACIONAL
        }
        setSelectedZoomItem(selectedItem)

        var zoomLimp1 = setInterval(function () {
          if (typeof window['searchUnidadeOrganizacional'].setValue == 'function') {
            window['searchUnidadeOrganizacional'].setValue(datasetun.values[0].NOMEUNIDADEORGANIZACIONAL);
            clearInterval(zoomLimp1)
          } else {
            $('#searchUnidadeOrganizacional').val(datasetun.values[0].NOMEUNIDADEORGANIZACIONAL);
          }
        }, 100)

      }
    } else {
      var zoomLimp2 = setInterval(function () {
        if (typeof window['searchUnidadeOrganizacional'].setValue == 'function') {
          reloadZoomFilterValues('searchUnidadeOrganizacional', filter);
          clearInterval(zoomLimp2)
        }
      }, 100)
    }
  }

  /**
   * Rotina para carga do centro de custo
   * @param {param} id
   */
  carregarCentroDeCusto(entidade, unidade, id) {
    //let matricula = $('#loginSolicitante').val();
    let matricula = $('#loginSolicitante').val() == 'eduardo.totvs' ? 'nilton.araruna' : $('#loginSolicitante').val();
    if (!Util.estaVazio(id)) {
      let cUnidadeOrganizacional = DatasetFactory.createConstraint('CODUNIDADEORGANIZACIONAL', unidade, unidade, ConstraintType.MUST);
      let cLoginUsuario = DatasetFactory.createConstraint('LOGIN', matricula, matricula, ConstraintType.MUST);
      let cCodigoCentroCusto = DatasetFactory.createConstraint('CODCCUSTO', id, id, ConstraintType.MUST);
      let cSqlLimit = DatasetFactory.createConstraint('sqlLimit', '1', '1', ConstraintType.MUST);
      let dsCentroCustoRM = DatasetFactory.getDataset('dsConsultaCentroCustoUsuario_wsConsultaSQL', null,
        [cUnidadeOrganizacional, cLoginUsuario, cCodigoCentroCusto, cSqlLimit], null);
      if (dsCentroCustoRM.values.length > 0) {
        var obj = {
          CODCCUSTO: dsCentroCustoRM.values[0].CODCCUSTO,
          DESC_CCUSTO: dsCentroCustoRM.values[0].DESC_CCUSTO,
          LOGINRMGERENTE: dsCentroCustoRM.values[0].LOGINRMGERENTE,
          LOGINRMGERENTEGERAL: dsCentroCustoRM.values[0].LOGINRMGERENTEGERAL,
          dataSize: 1,
          id: dsCentroCustoRM.values[0].DESC_CCUSTO,
          inputId: 'searchCentroCustoDadosContrato',
          inputName: 'searchCentroCustoDadosContrato',
          selected: true,
          text: dsCentroCustoRM.values[0].DESC_CCUSTO
        }
        setSelectedZoomItem(obj);
        var zoomLimp3 = setInterval(function () {
          if (typeof window['searchCentroCustoDadosContrato'].setValue == 'function') {
            window['searchCentroCustoDadosContrato'].setValue(dsCentroCustoRM.values[0].DESC_CCUSTO);
            reloadZoomFilterValues('searchCentroCustoDadosContrato', `LOGIN,${matricula},CODENTIDADE,${entidade},CODUNIDADEORGANIZACIONAL,${unidade},CODCCUSTO,${id},sqlLimit,1`);
            clearInterval(zoomLimp3)
          } else {
            $('#searchCentroCustoDadosContrato').val(dsCentroCustoRM.values[0].DESC_CCUSTO);
          }
        }, 100)
      }
    } else {
      var searchCentroCustoDadosContrato = setInterval(function () {
        if (typeof window['searchCentroCustoDadosContrato'].setValue == 'function') {
          if (unidade) {
            reloadZoomFilterValues('searchCentroCustoDadosContrato', `LOGIN,${matricula},CODUNIDADEORGANIZACIONAL,${unidade},CODENTIDADE,${entidade}`);
            window['searchCentroCustoDadosContrato'].disable(false);
          } else {
            reloadZoomFilterValues('searchCentroCustoDadosContrato', `LOGIN,${matricula}`);
            $('#codigoEntidadeCCusto').val('');
            $('#loginGerente').val('');
            $('#loginGerenteGeral').val('');
            $('#descricaoCentroCusto').val('');
            window['searchCentroCustoDadosContrato'].disable(true);
            window['searchCentroCustoDadosContrato'].clear();
          }
          clearInterval(searchCentroCustoDadosContrato);
        }
      }, 100);
    }
  }

  buscarCPF(cpf) {
    let cpfString = Util.a2hex(cpf);
    const c1 = DatasetFactory.createConstraint('cpf', cpfString, cpfString, ConstraintType.MUST);
    return DatasetFactory.getDataset('ds_vertsign_assinantes', null, new Array(c1), null);
  }

  incluirNovoAssinanteFormulario(colleagueId, nome, cpf, email, tipo) {
    if (!tipo) {
      tipo = 'E';
    }
    var cNome = {
      name: 'nome',
      value: nome
    };

    var cEmail = {
      name: 'email',
      value: email
    };

    var cTipo = {
      name: 'tipo',
      value: tipo
    };

    var cCPF = {
      name: 'cpf',
      value: cpf
    };

    var metodo = {
      name: 'metodo',
      value: 'createSigner'
    };

    var params = [cNome, cEmail, cTipo, cCPF, metodo];
    var constraints = []

    params.forEach(function (param) {
      constraints.push(DatasetFactory.createConstraint(param.name, param.value, param.value, ConstraintType.MUST));
    });

    return DatasetFactory.getDataset('ds_auxiliar_vertsign', null, constraints, null);
  }

  carregaRazaoSocial(flag = false) {
    this.autocomplete.autoCompleteRazaoSocial = FLUIGC.autocomplete('#searchRazaoSocialForn', {
      source: {
        url: '/api/public/ecm/dataset/search?datasetId=dsFinCFODataBR_readView_sync&searchField=NOME&',
        limit: 30,
        offset: 0,
        root: 'content',
        patternKey: 'searchValue',
        contentType: 'application/json'
      },
      minLength: 0,
      displayKey: 'NOME',
      tagClass: 'tag-gray',
      type: 'tagAutocomplete',
      tagMaxWidth: '800',
      multiSelect: false,
      highlight: true,
      maxTags: 1,
    });

    var cnpj = '';
    var nomefantasia = '';
    var inscricaoEstadual = '';

    $('#searchRazaoSocialForn').on("fluig.autocomplete.selected", function () {
      cnpj = formController.autocomplete.autoCompleteRazaoSocial.items()[0]['CGCCFO']
      nomefantasia = formController.autocomplete.autoCompleteRazaoSocial.items()[0]['NOMEFANTASIA'];
      inscricaoEstadual = formController.autocomplete.autoCompleteRazaoSocial.items()[0]['INSCRESTADUAL'];
      $('#cnpj').val(cnpj);
      $('#nomeFantasia').val(nomefantasia);
      $('#inscricaoEstadual').val(inscricaoEstadual);
      Util.desabilitarCampos(['#cnpj', '#nomeFantasia', '#inscricaoEstadual']);
    });

    $('#searchRazaoSocialForn').on("fluig.autocomplete.itemRemoved", function () {
      $('#cnpj').val('');
      $('#nomeFantasia').val('');
      $('#inscricaoEstadual').val('');
      Util.desabilitarCampos(['#cnpj', '#nomeFantasia', '#inscricaoEstadual'], false);
    });

    $(this.autocomplete.autoCompleteRazaoSocial.input()).on("change", function (data) {
      $("#searchRazaoSocialForn").val(data.target.value);
    });

    if (flag) {
      var razaoSocial = {
        NOME: $("#searchRazaoSocialForn").val()
      }
      this.autocomplete.autoCompleteRazaoSocial.add(razaoSocial);
      Util.desabilitarCampos(['#cnpj', '#nomeFantasia', '#inscricaoEstadual']);
    }
  }


  adicionarItem(event) {
    if ($('#solicitacaoCNPJContratoRM').val() ? $('#solicitacaoCNPJContratoRM').val()[0] : null) {
      const TABELA_ITEM = 'tableAdicionarItem';
      const indexLinhaCriada = wdkAddChild(TABELA_ITEM);
      formController.carregaFuncionalidadesTabela()
      const numeroContratoAtual = $('#solicitacaoRMContrato').val();
      if (Util.estaVazio(numeroContratoAtual)) {
        window[`itemContrato___${indexLinhaCriada}`].disable(true);
      } else {
        const coligada = $('#solicitacaoContratoCodColigada').val();
        reloadZoomFilterValues(`itemContrato___${indexLinhaCriada}`, `parameters,CODCOLIGADA=${coligada};CODCONTRATO=${numeroContratoAtual}`);
      }

      $('#unidadeItem___' + indexLinhaCriada).val('');
      $('#descricaoCentroCustoItem___' + indexLinhaCriada).val('');
      $('#valorUnitario___' + indexLinhaCriada).val('');
      $('#valorTotal___' + indexLinhaCriada).val('');

      this.carregaFuncionalidadesTabela()

      $('[id^=collapseItemContrato___]').not(':first').collapse()
    } else {
      Util.exibirToast('Atenção:', 'Para adicionar itens é necessário selecionar um fornecedor.', 'warning');
    }
  }

  deleteItem(elementRemovido) {
    fnWdkRemoveChild(elementRemovido);
    this.carregaFuncionalidadesTabela()
    if ($('#tableAdicionarItem tr').length - 2 == 0) {
      $("#valorNotaFiscal").val('');
      $("#valorTotalNotaFiscal").val('');
    }
  }

  carregaFuncionalidadesTabela(quantidade, valorUnitario, posicaoTabela) {

    $('.real').mask('#.##0,00', { reverse: true, placeholder: '0,00' });

    if (!Util.estaVazio(valorUnitario)) {
      var total = quantidade * Number(valorUnitario);

      $("#valorTotal___" + posicaoTabela).val(total.toLocaleString('pt-br', { minimumFractionDigits: 2 }));

      let valorTotalNota = 0;
      $($('table#tableAdicionarItem tbody tr').not(':first').find('[name^=valorTotal___]')).map((a, b) => valorTotalNota = parseFloat(valorTotalNota) + parseFloat(b.value.replaceAll('.', '').replace(',', '.')))

      if (typeof $('#valorTotalNotaFiscal').mask === 'function') {
        valorTotalNota > 0 ? $('#valorTotalNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', { minimumFractionDigits: 2 })) : $('#valorTotalNota').val('0,00');
        valorTotalNota > 0 ? $('#valorNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', { minimumFractionDigits: 2 })) : $('#valorTotalNota').val('0,00');
      }

      $('#valorUnitario___' + posicaoTabela).val(!isNaN(parseFloat(valorUnitario)) ? parseFloat(valorUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace('R$', '') : '0,00');

      $('#quantidade___' + posicaoTabela).attr('readonly', false);
      $('#valorUnitario___' + posicaoTabela).attr('readonly', false);
    }

    $.makeArray($('input[id^="valorUnitario__"]')).forEach(input => {
      $(input).on("change", function (data) {

        var quantidade = $(input).parent().parent().parent().find('[id^="quantidade__"]').val();
        var valor = data.target.value;

        var total = quantidade * parseFloat(valor.replace(/[^0-9,]*/g, '').replace(',', '.')).toFixed(2);

        $(input).parent().parent().parent().find('[name^="valorTotal__"').val(total.toLocaleString('pt-br', { minimumFractionDigits: 2 }));

        let valorTotalNota = 0;
        $($('table#tableAdicionarItem tbody tr').not(':first').find('[name^=valorTotal___]')).map((a, b) => valorTotalNota = parseFloat(valorTotalNota) + parseFloat(b.value.replaceAll('.', '').replace(',', '.')))

        if (typeof $('#valorTotalNotaFiscal').mask === 'function') {
          valorTotalNota > 0 ? $('#valorTotalNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', { minimumFractionDigits: 2 })) : $('#valorTotalNota').val('0,00');
          valorTotalNota > 0 ? $('#valorNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', { minimumFractionDigits: 2 })) : $('#valorTotalNota').val('0,00');
        }

        if ($(input).parent().parent().find('[name^="valorTotal__"').val() == 'NaN') {
          $(input).parent().parent().find('[name^="valorTotal__"').val('0,00');
        }
      });
    });

    $.makeArray($('input[id^="quantidade___"]')).forEach(input => {
      $(input).on("change", function (data) {

        var valor = $(input).parent().parent().find('[name^="valorUnitario__"]').val();
        var quantidade = parseInt(data.target.value);

        var total = quantidade * parseFloat(valor.replace(/[^0-9,]*/g, '').replace(',', '.')).toFixed(2);

        $(input).parent().parent().find('[name^="valorTotal__"').val(total.toLocaleString('pt-br', { minimumFractionDigits: 2 }));

        let valorTotalNota = 0;
        $($('table#tableAdicionarItem tbody tr').not(':first').find('[name^=valorTotal___]')).map((a, b) => valorTotalNota = parseFloat(valorTotalNota) + parseFloat(b.value.replaceAll('.', '').replace(',', '.')))

        if (typeof $('#valorTotalNotaFiscal').mask === 'function') {
          valorTotalNota > 0 ? $('#valorTotalNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', { minimumFractionDigits: 2 })) : $('#valorTotalNota').val('0,00');
          valorTotalNota > 0 ? $('#valorNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', { minimumFractionDigits: 2 })) : $('#valorTotalNota').val('0,00');
        }

        if ($(input).parent().parent().find('[name^="valorTotal__"').val() == 'NaN') {
          $(input).parent().parent().find('[name^="valorTotal__"').val('0,00');
        }
      });
    });

    let valorTotalNota = 0;
    $($('table#tableAdicionarItem tbody tr').not(':first').find('[name^=valorTotal___]')).map((a, b) => valorTotalNota = parseFloat(valorTotalNota) + parseFloat(b.value.replaceAll('.', '').replace(',', '.')))
    if (typeof $('#valorTotalNotaFiscal').mask === 'function') {
      valorTotalNota > 0 ? $('#valorTotalNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', { minimumFractionDigits: 2 })) : $('#valorTotalNota').val('0,00');
      valorTotalNota > 0 ? $('#valorNotaFiscal').val(parseFloat(valorTotalNota).toLocaleString('pt-BR', { minimumFractionDigits: 2 })) : $('#valorTotalNota').val('0,00');
    }


    $.makeArray($('input[id^="unidadeItem_"]')).forEach(function (element, index) {
      $(element).parent().parent().parent().find('legend[id^="itemTabela"]').text("Item " + (index + 1));
    });
  }

  verificarJaPossuiPagamentoNotaFiscal() {
    const numeroNotaFiscal = $('#numeroNotaFiscal').val();
    const cNumeroNota = DatasetFactory.createConstraint('numeroNotaFiscal', numeroNotaFiscal, numeroNotaFiscal, ConstraintType.MUST);
    let cnpjFornecedor = $('#solicitacaoCNPJContratoRM').val();

    const cFornecedor1 = DatasetFactory.createConstraint('solicitacaoCNPJContratoRM', cnpjFornecedor, cnpjFornecedor, ConstraintType.SHOULD);

    const pagamentosNotaFiscal = DatasetFactory.getDataset(
      'dsFormPagtoNotaFiscal',
      [],
      [
        cNumeroNota,
        cFornecedor1
      ],
      null
    ).values;

    if (pagamentosNotaFiscal.length > 0) {
      Util.exibirToast('Atenção:', 'Já existe um processo com o mesmo número de nota fiscal e fornecedor.', 'danger');
    }
  }
  optionFisica(text) {
    let mensagem = "";
    switch (text) {
      case "1":
        mensagem = `
        <p>Anexos Obrigatórios:</p><br>
        <p>Cópia dos documentos pessoais (RG E CPF).</p><br>
        <p>Cópia do comprovante de Inscrição Estadual de Produtor Rural (caso tenha).</p>`;
        break;

      case "2":
        $(".divCredito").show();
        mensagem = `
        <p>Anexos Obrigatórios:</p><br>
        <p>Ficha cadastral de crédito.</p><br>
        <p>Cópia dos documentos pessoais (RG E CPF).</p><br>
        <p>Cópia dos documentos pessoais (RG E CPF) do cônjuge.</p><br>
        <p>Cópia do comprovante de Inscrição Estadual de Produtor Rural.</p><br>
        <p>Comprovante de renda atualizado.</p><br>
        <p>Cópia do comprovante de endereço para correspondência atualizado.</p><br>`;
        break;
      case "3":
        mensagem = `
            <p>Anexos Obrigatórios:</p><br>
            <p>Proposta para Cooperar com firma reconhecida.</p><br>
            <p>Ficha cadastral de crédito com firma reconhecida.</p><br>
            <p>Cópia dos documentos pessoais (RG E CPF) do pretendente.</p><br>
            <p>Cópia dos documentos pessoais (RG E CPF) do cônjuge.</p><br>
            <p>Cópia da certidão de casamento.</p><br>
            <p>Certidões negativas de Protesto, Cível e Criminal de competência estadual e federal, inclusive de juizados especiais, obtida junto aos cartórios de distribuição das comarcas onde tenha residido nos últimos 05 (cinco) anos.</p>
            <p>Obs: As certidões descritas acima deverão ser originais e expedidas a menos de 30 (trinta) dias.</p><br>
            <p>Cópia do comprovante de Inscrição Estadual de Produtor Rural.</p><br>
            <p>Cópia da certidão do registro de imóveis da propriedade rural atualizada ou contrato de arrendamento rural devidamente registrado.</p><br>
            <p>Cópia da declaração do ITR do exercício atual.</p><br>
            <p>Cópia da ficha sanitária do rebanho atualizada.</p><br>
            <p>Cópia do comprovante de endereço para correspondência com emissão a menos de 30 dias.</p><br>
            <p>Comprovante de renda.</p><br>
            <p>Declaração de Aptidão (DAP) ao Programa Nacional de Fortalecimento da Agricultura Familiar – PRONAF, ou o Cadastro Nacional da Agricultura Familiar - CAF. Caso o produtor rural possua até 04 módulos fiscais e não se enquadre na Agricultura Familiar, deverá apresentar Declaração emitida pelo órgão competente, atestando que não possui direito a DAP ou CAF.</p><br>`;
        break;
      default:
        mensagem = `
            <p>Preencha o tipo de cadastro</p>
            `;
    }

    return mensagem;
  }

  optionjuridica(text) {
    let mensagem = "";
    switch (text) {
      case "1":
        mensagem = `
            <p>Anexos Obrigatórios:</p><br>
            <p>Cópia CNPJ e Inscrição Estadual.</p><br>`;
        break;

      case "2":
        $(".divCredito").show();
        mensagem = `
            <p>Anexos Obrigatórios:</p><br>
            <p>Ficha cadastral de crédito.</p><br>
            <p>Cópia CNPJ e Inscrição Estadual.</p><br>
            <p>Cópia do ato constitutivo da empresa (estatuto/contrato social e alterações).</p><br>
            <p>Cópia dos documentos pessoais (RG E CPF) dos representantes legais e seus cônjuges.</p><br>
            <p>Cópia do comprovante de endereço para correspondência atualizado.</p><br>
            <p>Cópia comprovante de renda atualizado.</p><br>`;
        break;

      case "3":
        mensagem = `
            <p>Anexos Obrigatórios:</p><br>
            <p>Proposta para Cooperar com firma reconhecida.</p><br>
            <p>Ficha cadastral de crédito com firma reconhecida.</p><br>
            <p>Cópia CNPJ e Inscrição Estadual.</p><br>
            <p>Cópia do ato constitutivo da empresa (estatuto/contrato social e alterações).</p><br>
            <p>Cópia dos documentos pessoais (RG E CPF) dos representantes legais e seus cônjuges.</p><br>
            <p>Certidões negativas de Protesto, Cível e Criminal de competência estadual e federal, inclusive de juizados especiais, obtida junto aos cartórios de distribuição das comarcas onde tenha se estabelecido nos últimos 05 (cinco) anos.</p>
            <p>Obs: As certidões descritas acima deverão ser originais e expedidas a menos de 30 (trinta) dias.</p><br>
            <p>Cópia da certidão do registro de imóveis da propriedade rural atualizada ou contrato de arrendamento rural devidamente registrado.</p><br>
            <p>Cópia da declaração do ITR do exercício atual.</p><br>
            <p>Cópia da ficha sanitária do rebanho atualizada.</p><br>
            <p>Cópia do comprovante de endereço para correspondência com emissão a menos de 30 dias.</p><br>
            <p>Comprovante de renda.</p><br>
            <p>Declaração de Aptidão (DAP) ao Programa Nacional de Fortalecimento da Agricultura Familiar – PRONAF, ou o Cadastro Nacional da Agricultura Familiar - CAF. Caso o produtor rural possua até 04 módulos fiscais e não se enquadre na Agricultura Familiar, deverá apresentar Declaração emitida pelo órgão competente, atestando que não possui direito a DAP ou CAF.</p><br>`;
        break;
      default:
        mensagem = `
            <p>Preencha o tipo de cadastro</p>
            `;
    }

    return mensagem;
  }

  carregarAutocompleteRepresentantesLegais(id, tipo) {
    this._criarAutocompleteRepresentantesLegais(id, tipo);
    this.autocomplete[id].on('fluig.autocomplete.selected', function (data) {
      Util.mostraLoadingComFuncao({
        anyFunction: () => {
          let idx = data.target.id.split('___')
          const resultadoBusca = Util.buscarItemJaSelecionadoTabela('tableSignatarioInstJur', 'idSignatario', data.item['metadata#id']);
          if (resultadoBusca) {
            Util.exibirToast('Atenção: ', 'Não é possível adicionar dois signatários iguais. ', 'warning');
            $(`#nomeSignatario___${idx}`).val('')
          } else {
            $(`#idSignatario___${idx[1]}`).val(data.item['metadata#id'])
            $(`#cpfSignatario___${idx[1]}`).val(Util.hex2(data.item.cpf))
            $(`#emailSignatario___${idx[1]}`).val(Util.hex2(data.item.email))
          }
        }, anyParam: [], context: this
      });
    });
    this.autocomplete[id].on('fluig.autocomplete.itemRemoved', function (data) {
      Util.mostraLoadingComFuncao({
        anyFunction: () => {
          let idx = data.target.id.split('___')
          $(`#idSignatario___${idx[1]},#cpfSignatario___${idx[1]},#emailSignatario___${idx[1]}`).val('')
        }, anyParam: [], context: this
      });
    });
  }

  _criarAutocompleteRepresentantesLegais(id, tipo) {
    this.autocomplete[id] = FLUIGC.autocomplete(id, Util.criarAutocomplete(id, tipo))
  }

  static salvarPainelHistorico(painel, data, nomeSolicitante) {
    var indiceLinhaAdicionada = wdkAddChild("tableHistoricoXX");

    var inputs = {};
    $.makeArray($(`#${painel}`).find("[id]")).forEach(el => {
      if ((el.type == "radio" || el.type == "checkbox")) {
        if ($(el).is(":checked")) {
          inputs[`${indiceLinhaAdicionada}_${el.id}`] = el.value
        }
      } else {
        inputs[`${indiceLinhaAdicionada}_${el.id}`] = el.value
      }
    })

    inputs[`${indiceLinhaAdicionada}_jsonPastas`] = $("#jsonPastas").val();
    inputs[`current_state___${indiceLinhaAdicionada}`] = WKNumState;
    $(`textarea#jsonPastasHistorico___${indiceLinhaAdicionada}`).val(inputs[`${indiceLinhaAdicionada}_jsonPastas`]);

    var htmlOriginalPainel = $(`#${painel}`).html()
    var htmlReduzido = htmlOriginalPainel.replace(/>\s+|\s+</g, function (m) {
      return m.trim();
    });


    var htmlNovosIds = htmlReduzido.replaceAll('id="', `id="${indiceLinhaAdicionada}_`)
    htmlNovosIds = htmlNovosIds.replaceAll('name="', `name="${indiceLinhaAdicionada}_`)
    htmlNovosIds = htmlNovosIds.replaceAll('for="', `for="${indiceLinhaAdicionada}_`)

    const chunks = new Array(4)

    $(`#indiceHistorico___${indiceLinhaAdicionada}`).val(indiceLinhaAdicionada);
    $(`#dataHistorico___${indiceLinhaAdicionada}`).val($(`#${data}`).val());
    $(`#nomeSolicitanteHistorico___${indiceLinhaAdicionada}`).val($(`#${nomeSolicitante}`).val());

    var sobra = htmlNovosIds.length % 4;
    var quantidadeChars = (htmlNovosIds.length - sobra) / 4;

    for (let i = 0, o = 0; i < 4; ++i, o += quantidadeChars) {
      if (i == 3)
        chunks[i] = htmlNovosIds.substr(o, quantidadeChars + sobra)
      else
        chunks[i] = htmlNovosIds.substr(o, quantidadeChars)

      $(`#painelHistorico${i + 1}___${indiceLinhaAdicionada}`).val(chunks[i]);
    }
    $(`#valuesCamposHistorico___${indiceLinhaAdicionada}`).val(JSON.stringify(inputs));
    $(`#idEtapa___${indiceLinhaAdicionada}`).val(WKNumState);
    $(`#tituloEtapa___${indiceLinhaAdicionada}`).val(FormController.dicEtapas(WKNumState));

  }

  static dicEtapas(etapa) {
    let arrEtapas = [
      {
        id: 0,
        title: 'Solicitação',

      },
      {
        id: 14,
        title: 'Solicitação',
      },
      {
        id: 108,
        title: 'Correção',
      },
      {
        id: 1,
        title: 'Analisar Dados do Cadastro',
      },
      {
        id: 4,
        title: 'Revisar Cadastro',
      },
      {
        id: 3,
        title: 'Aprovar Cadastro - Gerente',
      },
      {
        id: 91,
        title: 'Análise Técnica',
      },
      {
        id: 94,
        title: 'Análise Jurídico',
      },
      {
        id: 6,
        title: 'Realizar Pré Reunião',
      },
      {
        id: 7,
        title: 'Conselho Administrativo',
      },
      {
        id: 58,
        title: 'Aprovar Cadastro - Comitê',
      },
      {
        id: 9,
        title: 'Realizar Cadastro no Sistema Externo',
      },
      {
        id: 11,
        title: 'Lançar Capital Social - Sistema Externo',
      },
      {
        id: 12,
        title: 'Lançar Inscrição Estadual no Sistema Externo',
      },

    ]

    if (arrEtapas.filter(a => a["id"] == etapa).length) {
      return arrEtapas.filter(a => a["id"] == etapa)[0].title
    }

    return `Etapa ${etapa}`;
  }

  exibirPaineisHistorico(classesRemover) {
    /** PERCORRE TABLE DE HISTÓRICO */
    $.makeArray($("[id^='rowPainelHistorico___']")).reverse().forEach((row, idx) => {

      var indexHistorico = row.id.split("___")[1]

      /** VERIFICAR SE O PAINEL É DO TIPO 'ASSINATURA ELETRONICA' E FAZ O TRATAMENTO ADEQUADO */
      if ($(row).find("textarea[id^='painelHistorico___']").val() == "Painel Assinatura") {

        let htmlPainelAssinatura = `
        <div class="panel panel-primary" id="painelAssinaturaEletronica___${indexHistorico}">
          <div class="panel-heading">
            <h4 class="panel-title">
              <a class="collapse-icon" data-toggle="collapse" href="#collapseAssinaturaEletronica___${indexHistorico}">
                <b>${indexHistorico}. Assinatura Eletrônica | ${$(row).find("input[id^='nomeSolicitanteHistorico___']").val()}</b>
              </a>
            </h4>
          </div>
          <div id="collapseAssinaturaEletronica___${indexHistorico}" class="panel-collapse collapse in">
            <div class="panel-body">
              <div class="row">
                <div class="tabelaAssinaturas___${indexHistorico}" id="tabelaAssinaturas___${indexHistorico}"></div>
              </div>
            </div>
          </div>
        </div>
        `

        /** INSERE PAINEL DE HISTÓRICO LOGO APÓS O PAINEL ORIGINAL DE SOLICITAÇÃO */
        $(htmlPainelAssinatura).insertAfter("#painelSolicitacao")

        /** CHAMA MÉTODO PARA MONTAR TABLE DE ASSINANTES */
        let jsonAssinantes = JSON.parse($(row).find("textarea[id^='valuesCamposHistorico___']").val());
        Assinatura.carregarTabelaAssinaturasHistorico(jsonAssinantes, indexHistorico)

      } else {
        if ($(row).find("textarea[id^='painelHistorico1___']").val() == "HISTORICO_WEB_APP") {
          var htmlPanel = this.htmlToAppendHistoric($(row).find("textarea[id^='painelHistorico2___']").val(), $(row).find("input[id^='indiceHistorico___']").val());
          $(`<div class="panel panel-primary" id="idPainelHistorico___${indexHistorico}">` + htmlPanel + "</div>").insertAfter("#painelSolicitante")
        } else {
          /** INSERE PAINEL DE HISTÓRICO LOGO APÓS O PAINEL ORIGINAL DE SOLICITAÇÃO */
          $(`<div class="panel panel-primary" id="idPainelHistorico___${indexHistorico}">` + $(row).find("textarea[id^='painelHistorico1___']").val() +
            $(row).find("textarea[id^='painelHistorico2___']").val() + $(row).find("textarea[id^='painelHistorico3___']").val() +
            $(row).find("textarea[id^='painelHistorico4___']").val() + "</div>")
            .insertAfter("#painelSolicitante2")
        }

        let valuesCampos = $(row).find("textarea[id^='valuesCamposHistorico___']").val()

        if (valuesCampos == "") {
          valuesCampos = "{}"
        }

        var valuesInputs = JSON.parse(valuesCampos)

        /** REMOVE CLASSES QUE FAZEM CONTROLE DA VISUALIZAÇÃO DO PAINEL */
        if (classesRemover.length > 0) {
          classesRemover.forEach(classe => {
            $(`#idPainelHistorico___${indexHistorico}`).find(`.${classe}`).removeClass(classe);
          });
        }

        /** ATUALIZA O VALOR DO HREF DOS COLLAPSES PARA QUE NÃO HAJA CONFLITO COM O PAINEL ORIGINAL */
        let hrefCollpase = $(`#idPainelHistorico___${indexHistorico}`).find("[href^='#collapse']").attr("href")
        if (hrefCollpase == undefined) {
          hrefCollpase = "#1"
        }
        $(`#idPainelHistorico___${indexHistorico}`).find("[href^='#collapse']").attr("href", "#" + (indexHistorico) + "_" + (hrefCollpase.split("#")[1]))

        $.makeArray($(`#idPainelHistorico___${indexHistorico}`).find("[href^='#fieldsetCollapse']")).forEach(fieldset => {
          let hrefFieldset = $(fieldset).attr("href");
          $(fieldset).attr("href", "#" + (indexHistorico) + "_" + (hrefFieldset.split("#")[1]))
        })

        /** ATUALIZA HEADER DO PAINEL HISTÓRICO, ADICIONANDO O INDICE, NOME DO SOLICITANTE E A DATA  */
        $(`#idPainelHistorico___${indexHistorico}`).find(`[href^='#${indexHistorico}_collapse']`).find("b")
          .before(`<b>${$(row).find("input[id^='indiceHistorico___']").val()}. </b>`)
          .after(`<span>  |  ${$(row).find("input[id^='nomeSolicitanteHistorico___']").val()} ${$(row).find("input[id^='dataHistorico___']").val()}</span>`)

        /** REMOVE BOTÕES DE ANEXAR E DE EXCLUIR ANEXO */
        $(`#idPainelHistorico___${indexHistorico}`).find(".btn-danger").remove()
        $(`#idPainelHistorico___${indexHistorico}`).find(".file-input-wrapper").parent().remove()
        $(`#idPainelHistorico___${indexHistorico}`).find(`#${indexHistorico}_botaoAdicionarItem`).remove()
        $(`#idPainelHistorico___${indexHistorico}`).find(`.fluigicon-trash`).remove()

        /** CONTRAI COLLAPSE  */
        $(`#idPainelHistorico___${indexHistorico}`).find(".in").removeClass("in")
        $(`#idPainelHistorico___${indexHistorico}`).find(`[href^='#${indexHistorico}_fieldsetCollapse']`).next().addClass("in")

        /** PERCORRE O PAINEL DE HISTÓRICO PARA ENCONTRAR TODOS OS RADIOS E DESMARCALOS */
        $.makeArray($(`#idPainelHistorico___${indexHistorico}`).find("[id]")).forEach(el => {
          if ($(el).attr("type") == "radio") {
            $(el).prop("checked", false);
          }
        })

        /** PERCORRE O PAINEL DE HISTÓRICO PARA ENCONTRAR TODOS OS ELEMENTOS QUE TENHAM ID */
        $.makeArray($(`#idPainelHistorico___${indexHistorico}`).find("[id]")).forEach(el => {

          /** SALVA O ID ORIGINAL DO ELEMENTO */
          var id = $(el).attr("id");

          /** DESATIVA EVENTO DE CLICK NO ELEMENTO */
          if (el.id.includes('parecer_lais')) {
            console.log(el)
          }
          if (el.tagName !== 'TEXTAREA' && el.tagName !== 'FIELDSET') {
            $(el).css("pointer-events", "none");
          }

          if (el.id.includes('HIDE_LAIS')) {
            $(el).css("pointer-events", "auto");
          }

          /** Remove atributo tablename */
          var attrTablename = $(el).attr('tablename');
          if (typeof attrTablename !== 'undefined' && attrTablename !== false) {
            $(el).attr("tablename", `tablePaiFilho_${indexHistorico}`);
            $(el).attr("id", `tablePaiFilho_${indexHistorico}`);
            $(el).attr("name", `tablePaiFilho_${indexHistorico}`);
          }

          /** PASSA OS VALORES PARA OS CAMPOS E CASO SEJA CHECKBOX / RADIO SELECIONA A OPÇÃO CORRETA */
          if ($(el).attr("type") == "radio" || $(el).attr("type") == "checkbox") {
            if (valuesInputs[id]) {
              $(`#${id}`).prop("checked", true);
            } else {
              $(`#${id}`).prop("checked", false);
            }
          } else {
            $(`#${id}`).val(valuesInputs[id]);
          }

          let cadastroHiddenValue = $(`#${indexHistorico}_radio_cadastroHidden`).val();
          if (cadastroHiddenValue == 'fisico') {
            $(`#${indexHistorico}_radio-1c`).prop('checked', true);
          }
          if (cadastroHiddenValue == 'juridico') {
            $(`#${indexHistorico}_radio-2c`).prop('checked', true);
          }

          let tipoCadastroHiddenVal = $(`#${indexHistorico}_tipo_cadastroHidden`).val();
          if (tipoCadastroHiddenVal != 1) {
            $(`#${indexHistorico}_divNecessitaSupervisor`).show()
          }
          if (tipoCadastroHiddenVal == 2) {
            $(`#${indexHistorico}_divCredito`).show()
          }

          if ($(`#${id}`).attr("type") != "zoom") {
            Util.desabilitarCampos([`#${id}`]);
          }
        });

        if ($(`#${indexHistorico}_radio-1c`).prop('checked')) {
          $(`#${indexHistorico}_divcpf`).show();
          $(`#${indexHistorico}_divcnpj`).hide();
        }
        if ($(`#${indexHistorico}_radio-2c`).prop('checked')) {
          $(`#${indexHistorico}_divcpf`).hide();
          $(`#${indexHistorico}_divcnpj`).show();
        }
        // if ($(`#${indexHistorico}_radioEnviaSupervisorHidden`).val() != '1') {
        //   $('.divNecessitaSupervisor').show();
        // }

        /** Remove atributo detailname de todas as TR's */
        $.makeArray($(`#idPainelHistorico___${indexHistorico}`).find("tr")).forEach(el => {
          $(el).removeAttr("detailname");
        });

        $(".bootstrap-tagsinput:not(.bootstrap-tagsinput-max)").each(function (key, element) {
          var a = $(element)[0].previousSibling
          $(a).show()
        });
        $(".bootstrap-tagsinput:not(.bootstrap-tagsinput-max)").hide()
        // var jsonPastasHist;
        // var jsonPastasHistApp;

        /** ALTERA CHAMADA VISUALIZAÇÃO DOS ANEXOS PARA O JSONPASTAS DO HISTÓRICO */
        let jsonPastasHist = valuesInputs[`${indexHistorico}_jsonPastas`]
        let jsonPastasHistorico = $(`#jsonPastasHistorico___${indexHistorico}`).val()
        // let jsonPastasHistorico = $(`#jsonPastasHistorico___${indexHistorico}`).val()
        // let jsonPastasHistApp;

        if (!Util.estaVazio(jsonPastasHist)) {
          // let objJsonPastas = JSON.parse(jsonPastasHist)
          $(`#${indexHistorico}_divAnexosSolicitacao`).show()
          this.atualizarListaCategoriaHist(`${indexHistorico}_listaSolicitacao`, 'arquivosSolicitacao', jsonPastasHist);
          this.mostrarBloquearAnexo(`${indexHistorico}_anexarListaSolicitacao`, `${indexHistorico}_listaSolicitacao`);

          this.atualizarListaCategoriaHist(`${indexHistorico}_listaArquivosParecerSupervisor`, 'arquivosParecerSupervisor', jsonPastasHist);
          this.mostrarBloquearAnexo(`${indexHistorico}_inputAnexarListaParecerSuper`, `${indexHistorico}_listaArquivosParecerSupervisor`);

          // if (objJsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos['arquivosParecerSupervisor']) {
          //   if (objJsonPastas.pastaRaiz.filhos.pastaSolicitacao.filhos['arquivosParecerSupervisor'].arquivos) {
          //     // $(`#${indexHistorico}_divAnexosSolicitacao`).show()
          //     this.atualizarListaCategoriaHist(`${indexHistorico}_listaArquivosParecerSupervisor`, 'arquivosParecerSupervisor', jsonPastasHist);
          //     this.mostrarBloquearAnexo(`${indexHistorico}_inputAnexarListaParecerSuper`, `${indexHistorico}_listaArquivosParecerSupervisor`);
          //   }
          // }
        }

        $.makeArray($(`#idPainelHistorico___${indexHistorico}`).find(`button[id^='${indexHistorico}_visualizar']`)).forEach(btn => {
         let categoria = $(btn).attr("onclick").split("'")[1]
          //let categoria = 'propostaComercial'
          $(btn).attr("onclick", `formController.visualizarArquivoCategoriaHistorico('${jsonPastasHist}', '${categoria}')`)
        })



        /** RETORNA O EVENTO DE CLICK PARA BOTÕES DE VISUALIZAR ANEXO */
        $(`#idPainelHistorico___${indexHistorico}`).find("[id^='listaDocsIndicaClassi'], .btn-success").css("pointer-events", "auto");
        $(`#idPainelHistorico___${indexHistorico}`).find(".btn-success").attr("disabled", false)
        $(`div[id^='${indexHistorico}_collapse']`).removeAttr("style");
        $("textarea").removeAttr("style");
        $(`#idPainelHistorico___${indexHistorico}`).find(`textarea`).removeAttr("style")
      }
    });
  }

  htmlToAppendHistoric(panel, indexTableHistoric) {
    var painelSolicitacao = `
      <div class="panel-heading">
        <h4 class="panel-title">
          <a class="collapse-icon" data-toggle="collapse" href="#collapseSolicitacao">
            <b>Solicitacao</b>
          </a>
        </h4>
      </div>

      <div class="panel-collapse collapse in" id="collapseSolicitacao">
        <div class="panel-body">
          <input type="hidden" id="nomeCorrecao" name="nomeCorrecao" value= />
          <input type="hidden" id="dataCorrecao" name="dataCorrecao" value= />

          <div class="row">
            <div class="form-group">
              <div class="col-md-12">
                <fieldset class="fieldset-border" id="fieldsetDadosFornecedor">
                  <legend class="legend-border">Dados do Fornecedor</legend>

                  <div class="row">
                    <div class="col-md-12 form-group">
                      <label for="">Selecione um Cadastro: <span class="required text-danger"><strong>*</strong></span></label>
                      <select name="tipo_cadastro" id="tipo_cadastro" class="form-control">
                        <option value="0" selected disabled hidden>Selecione uma opção</option>
                        <option value="1">Cadastro Simples</option>
                        <option value="2">Cadastro Cliente</option>
                        <option value="3">Cadastro Cooperado</option>
                      </select>
                    </div>

                    <input type="hidden" name="tipo_cadastroHidden" id="tipo_cadastroHidden">
                  </div>

                  <div class="row">
                    <div class="col-md-2 form-group">
                      <div class="custom-radio custom-radio-inline custom-radio-primary">
                        <input type="radio" name="radio_cadastro" id="radio-1c" value="fisico">
                        <label for="radio-1c" id="pessoaFisica">Pessoa Física</label>
                      </div>
                      <div class="custom-radio custom-radio-inline custom-radio-primary">
                        <input type="radio" name="radio_cadastro" id="radio-2c" value="jurudico">
                        <label for="radio-2c" id="pessoaJuridica">Pessoa Jurídica</label>
                      </div>
                      <input type="hidden" name="radio_cadastroHidden" id="radio_cadastroHidden">
                    </div>
                  </div>
                  <div id="divAlert" class="alert alert-warning alert-dismissible" role="alert" style="display:none;"></div>

                  <div class="row divCredito" id="divCredito" style="display:none">
                    <div class="col-md-6 form-group">
                      <label for="valor_credito">Valor Solicitado (Crédito): <span class="required text-danger"><strong>*</strong></span></label>
                      <div class="input-group">
                        <div class="input-group-addon"><i class="flaticon flaticon-monetization-on icon-sm"></i></div>
                        <input type="text" name="valor_credito" id="valor_credito" class="form-control real" readonly>
                      </div>                                
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 form-group">
                      <label for="nome_completo">Nome: <span class="required text-danger"><strong>*</strong></span></label>
                      <input type="text" name="nome_completo" id="nome_completo" class="form-control" readonly>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 form-group divcpf" id="divcpf" style="display: none;">
                      <label for="esCPF">CPF: <span class="required text-danger"><strong>*</strong></span></label>
                      <input type="text" name="escCPF" id="escCPF" class="form-control" onkeydown="return Util.mascaraCpfCnpj(this, event)" onkeyup="return Util.mascaraCpfCnpj(this, event)" readonly>
                    </div>
                    <div class="col-md-6 form-group divcnpj" id="divcnpj" style="display: none;">
                      <label for="esCNPJ">CNPJ: <span class="required text-danger"><strong>*</strong></span></label>
                      <input type="text" name="escCNPJ" id="escCNPJ" class="form-control" onkeydown="return Util.mascaraCpfCnpj(this, event)" onkeyup="return Util.mascaraCpfCnpj(this, event)" readonly>
                    </div>
                    <div class="col-md-6 form-group">
                      <label for="inscricao_estadual">Inscrição Estadual: <span class="required text-danger"><strong>*</strong></span></label>
                      <input type="text" name="inscricao_estadual" id="inscricao_estadual" class="form-control" readonly>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6 form-group">
                      <label for="email">Email:</label>
                      <input type="email" name="email" id="email" class="form-control" readonly>
                    </div>
                    <div class="col-md-6 form-group">
                      <label for="telefone">Telefone: <span class="required text-danger"><strong>*</strong></span></label>
                      <input type="text" name="telefone" id="telefone" class="form-control phone" readonly>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-12 form-group">
                      <label for="observacoes">Observações:</label>
                      <textarea name="observacoes" class="form-control" id="observacoes" rows="4"></textarea>
                    </div>
                  </div>
                  
                  <div class="row" id="divLinkDownload" style="display: none;">
                    <div class="col-md-12">
                      <a id="downloadDocumentos" target="_blank">Faça o download do documento</a>
                    </div>
                  </div>
                </fieldset>

                <div class="row">
                  <div class="col-md-12 marginTop">
                    <fieldset class="fieldset-border" id="fieldsetAnexosSolicitacao">
                      <legend class="legend-border">Anexos</legend>

                      <div class="row form-group">
                        <div class="col-md-12">
                          <div class="row">
                            <div class="col-md-2 form">
                              <span class="file-input-wrapper btn btn-info btn-block" id="btnAnexListaSolicitacao">
                                Anexar
                                <input type="file" id="anexarListaSolicitacao" name="anexarListaSolicitacao"
                                  data-url="/ecm/upload"
                                  onclick="formController.anexarListaArquivos(this, 'arquivosSolicitacao', 'listaSolicitacao');"
                                  multiple style="height: 100%; width: 100%;"
                                />
                              </span>
                            </div>
                            <div class="col-md-10 docExigidos" style="display: block;">
                              <fieldset>
                                <div class="row">
                                  <ul class="list-group" id="listaSolicitacao"></ul>
                                </div>
                              </fieldset>
                            </div>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    var painelAnexarParecer = `
      <div class="panel-heading">
        <h4 class="panel-title">
          <a class="collapse-icon" data-toggle="collapse" href="#collapseSuperAnexarDoc">
            <b>SUPERVISOR - ANEXAR PARECER</S></b>
          </a>
        </h4>
      </div>
      <div class="panel-collapse collapse in" id="collapseSuperAnexarDoc">
        <div class="panel-body">
          <div class="row">
            <div class="form-group col-md-3">
              <label for="dataSuperAnexarParecer">Data Solicitação</label>
              <div class="input-group">
                <span class="input-group-addon">
                  <span class="fluigicon fluigicon-calendar"></span>
                </span>
                <input class="form-control" type="text" name="dataSuperAnexarParecer" id="dataSuperAnexarParecer" readonly>
              </div>
            </div>
            <div class="form-group col-md-6">
              <label for="nomeSuperAnexarParecer">Nome</label>
              <div class="input-group">
                <span class="input-group-addon">
                  <span class="fluigicon fluigicon-brand"></span>
                </span>
                <input class="form-control" type="text" name="nomeSuperAnexarParecer" id="nomeSuperAnexarParecer" readonly>
              </div>
            </div>
            <div class="form-group col-md-3">
              <label for="areaSuperAnexarParecer">Unidade/Área</label>
              <div class="input-group">
                <span class="input-group-addon">
                  <span class="fluigicon fluigicon-calendar"></span>
                </span>
                <input class="form-control" type="text" name="areaSuperAnexarParecer" id="areaSuperAnexarParecer" readonly>
              </div>
            </div>
          </div>

          <div class="row marginTop">
            <div class="form-group">
              <div class="col-md-4 text-center">
                <span class="file-input-wrapper btn btn-info btn-block" id="btnAnexarParecer">
                  Anexar Parecer
                  <input type="file" id="anexarParecerInput" name="anexarParecerInput" data-url="/ecm/upload" onclick="formController.controlarBotoesAnexo(this, AcaoAnexo.ANEXAR, 'parecerSupervisor')">
                </span>
              </div>
              <div class="col-md-4 text-center">
                <button type="button" id="visualizarParecer" name="visualizarParecer" class="btn btn-block btn-success" onclick="formController.controlarBotoesAnexo(this, AcaoAnexo.VISUALIZAR, 'parecerSupervisor')">
                  Visualizar Parecer
                </button>
              </div>

              <div class="col-md-4 text-center">
                <button type="button" id="excluirParecer" name="excluirParecer" class="btn btn-block btn-danger" onclick="formController.controlarBotoesAnexo(this, AcaoAnexo.EXCLUIR, 'parecerSupervisor')">
                  Excluir Parecer
                </button>
              </div>
            </div>
          </div>

          <div class="row marginTop">
            <div class="form-group col-md-12">
              <label for="">Observação</label>
              <textarea name="observacaoParecerSupervisor" id="observacaoParecerSupervisor" rows="5" class="form-control"></textarea>
            </div>
          </div>

          <div class="row marginTop">
            <div class="col-md-12">
              <fieldset class="fieldset-border" id="fieldsetAnexosParecerSupervisor">
                <legend class="legend-border">Anexos</legend>

                <div class="row form-group">
                  <div class="col-md-12">
                    <div class="row">
                      <div class="col-md-2">
                        <span class="file-input-wrapper btn btn-info btn-block" id="btnAnexarListaParecerSupervisor">
                          Anexar
                          <input type="file" id="inputAnexarListaParecerSuper" name="inputAnexarListaParecerSuper" data-url="/ecm/upload" onclick="formController.anexarListaArquivos(this, 'arquivosParecerSupervisor', 'listaArquivosParecerSupervisor')" multiple style="height: 100%; width: 100%;">
                        </span>
                      </div>

                      <div class="col-md-10 docExigidos" style="display: block;">
                        <fieldset>
                          <div class="row">
                            <ul class="list-group" id="listaArquivosParecerSupervisor"></ul>
                          </div>
                        </fieldset>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    `;

    var painelCadastroSistemaExterno = `
      <div class="panel-heading">
        <h4 class="panel-title">
          <a class="collapse-icon" data-toggle="collapse" href="#collapseCadastroDocumentos">
            <b>CADASTRO: REALIZAR CADASTRO NO SISTEMA EXTERNO</b>
          </a>
        </h4>
      </div>
      <div id="collapseCadastroDocumentos" class="panel-collapse collapse in">
        <div class="panel-body">

          <div class="row">
            <div class="form-group col-md-3">
              <label for="dataCadastroDocumentos">Data Solicita&ccedil;&atilde;o</label>
              <div class="input-group">
                <span class="input-group-addon">
                  <span class="fluigicon fluigicon-calendar"></span>
                </span>
                <input class="form-control" type="text" name="dataCadastroDocumentos" id="dataCadastroDocumentos"
                  readonly />
              </div>
            </div>
            <div class="form-group col-md-6">
              <label for="nomeCadastroDocumentos">Nome </label>
              <div class="input-group">
                <span class="input-group-addon">
                  <span class="fluigicon fluigicon-brand"></span>
                </span>
                <input class="form-control" type="text" name="nomeCadastroDocumentos" id="nomeCadastroDocumentos"
                  readonly />
              </div>
            </div>
            <div class="form-group col-md-3	">
              <label for="areaCadastroDocumentos">Unidade/Área</label>
              <div class="input-group">
                <span class="input-group-addon">
                  <span class="fluigicon fluigicon-brand"></span>
                </span>
                <input class="form-control" type="text" name="areaCadastroDocumentos" id="areaCadastroDocumentos"
                  readonly />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-9 form-group">
              <label for="matricula">Matricula:<span class="required text-danger"><strong>*</strong></span></label>
              <input type="text" name="matricula" id="matricula" class="form-control">
            </div>

            <div class="col-md-3 form-group marginTopMenor divRadioCorrecaoSimples" hidden>
              <label for="radio_correcao">Necessita correção? <span class="required text-danger"><strong>*</strong></span></label>
              <div class="row form-inline">
                <div class="custom-radio custom-radio-inline custom-radio-primary">
                  <input type="radio" name="radio_correcao" id="radio_correcao1" value="sim">
                  <label for="radio_correcao1" id="correcaoSim">Sim</label>
                </div>
                <div class="custom-radio custom-radio-inline custom-radio-primary">
                  <input type="radio" name="radio_correcao" id="radio_correcao2" value="nao">
                  <label for="radio_correcao2" id="correcaoNao">Não</label>
                </div>
                <input type="hidden" name="radio_correcao_hidden" id="radio_correcao_hidden">
              </div>
            </div>
          </div>
          

          <div class="row lancarInscricao" hidden>
            <div class="form-group col-md-12">
              <label for="lancarInscricaoEstadual">Deseja Lançar Inscrição Estadual no Sistema Externo?<span
                  class="required text-danger"><strong>*</strong></span></label>
              <div class="row form-inline">
                <div class="custom-radio custom-radio-primary">
                  <input type="radio" name="lancarInscricaoEstadual" value="sim" id="lancarInscricaoEstadual_1">
                  <label for="lancarInscricaoEstadual_1">Sim</label>
                </div>
                <div class="custom-radio custom-radio-primary marginLeft">
                  <input type="radio" name="lancarInscricaoEstadual" value="nao" id="lancarInscricaoEstadual_2">
                  <label for="lancarInscricaoEstadual_2">N&atilde;o</label>
                </div>
                <input type="hidden" name="lancarInscricaoEstadualHidden" id="lancarInscricaoEstadualHidden" />
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-12 form-group">
              <label for="parecer_cadastro">Parecer:<span
                  class="required text-danger"><strong>*</strong></span></label>
              <textarea name="parecer_cadastro" id="parecer_cadastro" class="form-control" cols="30"
                rows="4"></textarea>
            </div>
          </div>

          <div class="row">
            <div class="col-md-12 marginTop">
              <fieldset class="fieldset-border" id="fieldsetAnexosCadastro">
                <legend class="legend-border">Anexos</legend>
                <div class="row form-group">
                  <div class="col-md-12">
                    <div class="row">
                      <div class="col-md-2 form">
                        <span class="file-input-wrapper btn btn-info btn-block" id="btnAnexListaCadastro">
                          Anexar
                          <input type="file" id="anexarListaCadastro" name="anexarListaCadastro"
                            data-url="/ecm/upload"
                            onclick="formController.anexarListaArquivos(this, 'arquivosCadastro', 'listaCadastro');"
                            multiple style="height: 100%; width: 100%;" />
                        </span>
                      </div>
                      <div class="col-md-10 docExigidos" style="display: block;">
                        <fieldset class="">
                          <div class="row">
                            <ul class="list-group" id="listaCadastro">
                            </ul>
                          </div>
                        </fieldset>
                      </div>
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

        </div>
      </div>
    `;

    var jsonPanels = {
      'painelSolicitacao': painelSolicitacao,
      // 'painelSolicitacao': painelSolicitacao,,
      108: painelSolicitacao,
      124: painelAnexarParecer,
      9: painelCadastroSistemaExterno
    }

    var htmlReduzido = jsonPanels[panel].replace(/>\s+|\s+</g, function (m) {
      return m.trim();
    });

    var htmlNovosIds = htmlReduzido.replaceAll('id="', `id="${indexTableHistoric}_`);
    htmlNovosIds = htmlNovosIds.replaceAll('name="', `name="${indexTableHistoric}_`);
    htmlNovosIds = htmlNovosIds.replaceAll('for="', `for="${indexTableHistoric}_`);

    return htmlNovosIds;
  }

}

class AcaoZoom {
  static get SELECIONADO() {
    return true;
  }

  static get REMOVIDO() {
    return false;
  }
}

class ValidationError {
  constructor(message) {
    this.message = message;
  }
}
