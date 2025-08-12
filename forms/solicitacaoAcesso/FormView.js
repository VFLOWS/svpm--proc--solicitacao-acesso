class Painel {

  static get SOLICITACAO() {
    return "painelSolicitante";
  }

  static get SOLICITACAO2() {
    return "painelSolicitacao";
  }





  
  static get GESTOR_APROVAR() {
    return "painelGestor";
  }

  static get VALIDACAO_TEC() {
    return "painelValTec";
  }

  static get ANALISAR_ACESSOS() {
    return "painelValTecSOD";
  }

  static get EXECUTAR_SOLICITACAO() {
    return "painelTI";
  }



  
}

class TipoExibicaoPainel {
  static get MOSTRAR_BLOQUEAR() {
    return 'mostrarBloquear';
  }
  static get OCULTAR() {
    return 'ocultar';
  }
}

class FormView {
  constructor() {
    this.formController = null;
    this.paineis = {
      [Painel.INICIO]: {
        [TipoExibicaoPainel.MOSTRAR_BLOQUEAR]: this._bloquearMostrarSolicitacao,
      },
    }
  }

  setFormController(formController) {
    this.formController = formController;
  }

  mostrarBloquearCampos(...paineis) {
    for (const painel of paineis) {
      this.paineis[painel][TipoExibicaoPainel.MOSTRAR_BLOQUEAR](this.formController);
    }
  }

  ocultarPainel(...paineis) {
    for (const painel of paineis) {
      $(`#${painel}`).hide();
    }
  }

  destacarOpcaoAprovacao(...referenciasPainelAtual) {
    referenciasPainelAtual.map(referencia => {
      referencia = referencia.indexOf('#') != -1 ? referencia : `#${referencia}`;
      $(referencia)[0].className.includes('panel-primary') || $(referencia)[0].className.includes('panel-default')
        ? $(referencia)[0].className = 'panel panel-approval'
        : $(referencia).children(":first-child")[0].className = 'panel panel-approval'
    });
  }

  mostrarModalValidacao(painel) {
    painel = painel = painel.indexOf('#') != -1 ? painel : `#${painel}`;
    const nomePainel = $(`${painel} > .panel-heading > .panel-title > .collapse-icon > b`).html();
    const data = $(`${painel}`).find("[id^='data']").val();
    const nome = $(`${painel}`).find("[id^='nome']").val();
    const area = $(`${painel}`).find("[id^='area']").val();
    const justificativa = $(`${painel}`).find("textarea").val();

    setTimeout(() => {
      var modalAprovacao = FLUIGC.modal({
        title: 'Última Validação',
        content: Mustache.render(
          $('#templateAprovacao').html(),
          { atividade: nomePainel, data: data, nome: nome, area: area, justificativa: justificativa }
        ),
        id: 'fluig-modal',
        size: 'full',
        actions: [{
          'label': 'Fechar',
          'autoClose': true
        }]
      });
    }, 1500);
  }


}