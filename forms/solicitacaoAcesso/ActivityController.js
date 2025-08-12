class Activity {
	static get INICIO() {
		return 4;
	}
	static get INICIO_PADRAO() {
		return 0;
	}

	static get GESTOR_APROVAR() {
		return 5;
	}

	static get VALIDACAO_TEC() {
		return 16;
	}

	static get ANALISAR_ACESSOS() {
		return 21;
	}

	static get EXECUTAR_SOLICITACAO() {
		return 32;
	}
	static get CORRIGIR() {
		return 13;
	}
	static get FIM() {
		return 36;
	}
	static get FIM_CANCELAMENTO() {
		return 28;
	}
}



class ActivityController {

	constructor(type, currentActivity) {
		this._activityController = {
			[Activity.INICIO]: this._controllerActivityInicio,
			[Activity.INICIO_PADRAO]: this._controllerActivityInicio,
			[Activity.GESTOR_APROVAR]: this._controllerActivityGestorAprovar,
			[Activity.VALIDACAO_TEC]: this._controllerActivityValidacaoTec,
			[Activity.ANALISAR_ACESSOS]: this._controllerActivityAnalisarAcessos,
			[Activity.EXECUTAR_SOLICITACAO]: this._controllerActivityExecutarSolicitacao,
			[Activity.CORRIGIR]: this._controllerActivityInicio,
			[Activity.FIM_CANCELAMENTO]: this._controllerActivityFim,
			[Activity.FIM]: this._controllerActivityFim,
		};

		this._activityView = {
			[Activity.INICIO]: this._ViewActivityInicio,
			[Activity.INICIO_PADRAO]: this._ViewActivityInicio,
			[Activity.GESTOR_APROVAR]: this._ViewActivityGestorAprovar,
			[Activity.VALIDACAO_TEC]: this._ViewActivityValidacaoTec,
			[Activity.ANALISAR_ACESSOS]: this._ViewActivityAnalisarAcessos,
			[Activity.EXECUTAR_SOLICITACAO]: this._ViewActivityExecutarSolicitacao,
			[Activity.CORRIGIR]: this._ViewActivityInicio,
			[Activity.FIM_CANCELAMENTO]: this._ViewActivityFim,
			[Activity.FIM]: this._ViewActivityFim,
		};
		this._activityValidate = {
			[Activity.INICIO]: this._validateActivityInicio,
			[Activity.INICIO_PADRAO]: this._validateActivityInicio,
			[Activity.GESTOR_APROVAR]: this._validateActivityGestorAprovar,
			[Activity.VALIDACAO_TEC]: this._validateActivityValidacaoTec,
			[Activity.ANALISAR_ACESSOS]: this._validateActivityAnalisarAcessos,
			[Activity.EXECUTAR_SOLICITACAO]: this._validateActivityExecutarSolicitacao,
			[Activity.CORRIGIR]: this._validateActivityInicio,
			[Activity.FIM_CANCELAMENTO]: this._validateActivityFim,
			[Activity.FIM]: this._validateActivityFim,
		};

		this._accessFormType = type;
		this._activity = currentActivity;

		window["beforeSendValidate"] = (numState, nextState) =>
			this._activityValidate[this._activity](numState, nextState);
	}


	_controllerActivityInicio(formMode, atividade, formView, formController, customizado) {


			// 🔹 Adiciona automaticamente a primeira linha ao carregar o formulário
			if ($("#tbAcessos tbody tr").length === 1) {
				adicionarLinhaAcesso();
			}

	

		// Oculta os painéis que não serão usados nesta atividade
		formView.ocultarPainel(
			Painel.GESTOR_APROVAR,
			Painel.VALIDACAO_TEC,
			Painel.ANALISAR_ACESSOS,
			Painel.EXECUTAR_SOLICITACAO
		);
	
		// Adicionar evento ao botão de "Adicionar Acesso"
		$("#btnAdicionarAcesso").on("click", function () {
			adicionarLinhaAcesso();
		});
	
		// Delegar evento para remover linha
		$("#tbAcessos").on("click", ".btn-remover-acesso", function () {
			removerLinhaAcesso(this);
		});
	
		// Delegar evento para mudança no select de rotina
		$("#tbAcessos").on("change", "select[name^='rotina___']", function () {
			carregarOpcoesRotinaFluig($(this));
		});
	
	
	
		// Função para adicionar linha usando wdkAddChild
		function adicionarLinhaAcesso() {
			var idx = wdkAddChild('tbAcessos');
			limparCamposLinha(idx);
		}

		
	
		// Limpa valores da nova linha
		function limparCamposLinha(idx) {
			$(`#tipoAcesso___${idx}`).val("");
			$(`#usuarioBeneficiado___${idx}`).val("");
			$(`#moduloProtheus___${idx}`).val("");
			$(`#rotina___${idx}`).val("");
			$(`#justificativa___${idx}`).val("");
			$(`#data_inicio___${idx}`).val("");
			$(`#data_termino___${idx}`).val("");
			$(`#divPrivilegios___${idx}`).empty();
		}
	
		// Remove a linha, mantendo pelo menos 1
		function removerLinhaAcesso(botao) {
			if ($("#tbAcessos tbody tr").length > 1) {
				fnWdkRemoveChild(botao);
			} else {
				FLUIGC.toast({ message: 'É necessário manter pelo menos um acesso.', type: 'warning' });
			}
		}
	
		// Carregar opções de privilégios na linha específica
		function carregarOpcoesRotinaFluig($select) {
			var codigoRotina = $select.val();
			var idx = $select.attr("id").split("___")[1];
			var $divPrivilegios = $(`#divPrivilegios___${idx}`);
	
			$divPrivilegios.empty();
			if (!codigoRotina) return;
	
			var opcoes = [
				{ id: 'INCLUIR', descricao: 'Incluir' },
				{ id: 'ALTERAR', descricao: 'Alterar' },
				{ id: 'EXCLUIR', descricao: 'Excluir' },
				{ id: 'VISUALIZAR', descricao: 'Visualizar' },
				{ id: 'IMPRIMIR', descricao: 'Imprimir' },
				{ id: 'COPIAR', descricao: 'Copiar' },
				{ id: 'PESQUISAR', descricao: 'Pesquisar' },
				{ id: 'ORDENAR', descricao: 'Ordenar' },
				{ id: 'EXPORTAR', descricao: 'Exportar' },
				{ id: 'IMPORTAR', descricao: 'Importar' },
				{ id: 'VALIDAR', descricao: 'Validar' },
				{ id: 'CANCELAR', descricao: 'Cancelar' },
				{ id: 'LIBERAR', descricao: 'Liberar' },
				{ id: 'ESTORNAR', descricao: 'Estornar' },
				{ id: 'DUPLICAR', descricao: 'Duplicar' },
				{ id: 'ENVIAR', descricao: 'Enviar' },
				{ id: 'APROVAR', descricao: 'Aprovar' },
				{ id: 'REPROVAR', descricao: 'Reprovar' },
				{ id: 'ANEXAR', descricao: 'Anexar' },
				{ id: 'VINCULAR', descricao: 'Vincular' },
				{ id: 'DESVINCULAR', descricao: 'Desvincular' },
				{ id: 'ASSINAR', descricao: 'Assinar' },
				{ id: 'COMPARTILHAR', descricao: 'Compartilhar' },
				{ id: 'GERAR', descricao: 'Gerar' },
				{ id: 'CONFIGURAR', descricao: 'Configurar' },
				{ id: 'EXECUTAR', descricao: 'Executar' },
				{ id: 'MONITORAR', descricao: 'Monitorar' },
				{ id: 'AUDITAR', descricao: 'Auditar' },
				{ id: 'TODOS', descricao: 'Todos' }
			];
	
			var html = '<label>Privilégios:</label><div class="row">';
			opcoes.forEach(opcao => {
				html += `
					<div class="col-md-3">
						<div class="checkbox">
							<label>
								<input type="checkbox" name="privilegios___${idx}" value="${opcao.id}">
								${opcao.descricao}
							</label>
						</div>
					</div>
				`;
			});
			html += '</div>';
	
			$divPrivilegios.append(html);
		}
	}
	
	

	_ViewActivityInicio(formMode, atividade, formView, formController) {

		formView.ocultarPainel(

			Painel.GESTOR_APROVAR,
			Painel.VALIDACAO_TEC,
			Painel.ANALISAR_ACESSOS,
			Painel.EXECUTAR_SOLICITACAO,

		);
	}

	_validateActivityInicio(numState, nextState) {


		let errorMsg = '';
		let endOfLine = '</br>';
		$('.has-error').removeClass('has-error');

		try {


		} catch (error) {
			if (errorMsg != '') {
				throw errorMsg;
			} else {
				throw 'Erro interno do servidor. Recarregue a página com "F5" e tente novamente. Caso o erro persista, informe ao TI a seguinte mensagem: ' + error;
			}
		}

		if (errorMsg != '') {
			throw errorMsg;
		} else {
			
			
			FormController.salvarPainelHistorico('painelSolicitante', 'dataSolicitacao', 'nomeSolicitante');
			FormController.salvarPainelHistorico('painelSolicitacao', 'dataSolicitacao', 'nomeSolicitante');
		}
	}




	///////////////////////////////////////////

	_controllerActivityGestorAprovar(formMode, atividade, formView, formController) {

		$("[name=gestor_decisao]").change(function () {
			var valor = $(this).val();
			$("[name=cod_aprovacao_gestor]").val(valor);
		});

		formView.ocultarPainel(

			Painel.SOLICITACAO,
			Painel.SOLICITACAO2,
			Painel.VALIDACAO_TEC,
			Painel.ANALISAR_ACESSOS,
			Painel.EXECUTAR_SOLICITACAO,

		);


	}

	_ViewActivityGestorAprovar(formMode, atividade, formView, formController) {

		formView.ocultarPainel(

			Painel.SOLICITACAO,
			Painel.SOLICITACAO2,
			Painel.VALIDACAO_TEC,
			Painel.ANALISAR_ACESSOS,
			Painel.EXECUTAR_SOLICITACAO,

		);


	}

	_validateActivityGestorAprovar() {


		let errorMsg = '';
		let endOfLine = '</br>';
		$('.has-error').removeClass('has-error');

		try {


		} catch (error) {
			if (errorMsg !== '') {
				throw errorMsg;
			} else {
				throw 'Erro interno do servidor. Recarregue a página com F5 e tente novamente. Caso persista, informe ao TI: ' + error;
			}
		}

		if (errorMsg != '') {
			throw errorMsg;
		} else {
			FormController.salvarPainelHistorico('painelGestor', 'dataGestor', 'nomeGestor');
		}

	}


	///////////////////////////////////////////



	_controllerActivityValidacaoTec(formMode, atividade, formView, formController) {

		$("[name=tecnico_decisao]").change(function () {
			var valor = $(this).val();
			$("[name=cod_aprovacao_tecnico]").val(valor);
		});


		formView.ocultarPainel(
			Painel.SOLICITACAO,
			Painel.SOLICITACAO2,
			Painel.GESTOR_APROVAR,

			Painel.ANALISAR_ACESSOS,
			Painel.EXECUTAR_SOLICITACAO,

		);


	}

	_ViewActivityValidacaoTec(formMode, atividade, formView, formController) {

		formView.ocultarPainel(
			Painel.SOLICITACAO,
			Painel.SOLICITACAO2,
			Painel.GESTOR_APROVAR,

			Painel.ANALISAR_ACESSOS,
			Painel.EXECUTAR_SOLICITACAO,

		);

	}

	_validateActivityValidacaoTec() {
		let errorMsg = '';
		let endOfLine = '</br>';
		$('.has-error').removeClass('has-error');

		try {


		} catch (error) {
			if (errorMsg !== '') {
				throw errorMsg;
			} else {
				throw 'Erro interno do servidor. Recarregue a página com F5 e tente novamente. Caso persista, informe ao TI: ' + error;
			}
		}

		if (errorMsg !== '') {
			throw errorMsg;
		} else {
			FormController.salvarPainelHistorico('painelValTec', 'dataValTec', 'nomeValTec');
		}
	}




	///////////////////////////////////////////

	_controllerActivityAnalisarAcessos(formMode, atividade, formView, formController, customizado) {


		$("[name=sod_decisao]").change(function () {
			var valor = $(this).val();
			$("[name=cod_aprovacao_sod]").val(valor);
		});


		formView.ocultarPainel(
			Painel.SOLICITACAO,
			Painel.SOLICITACAO2,
			Painel.GESTOR_APROVAR,
			Painel.VALIDACAO_TEC,

			Painel.EXECUTAR_SOLICITACAO,

		);


	}

	_ViewActivityAnalisarAcessos(formMode, atividade, formView, formController) {


		formView.ocultarPainel(
			Painel.SOLICITACAO,
			Painel.SOLICITACAO2,
			Painel.GESTOR_APROVAR,
			Painel.VALIDACAO_TEC,

			Painel.EXECUTAR_SOLICITACAO,

		);

	}

	_validateActivityAnalisarAcessos() {
		let errorMsg = '';
		let endOfLine = '</br>';
		$('.has-error').removeClass('has-error');

		try {


		} catch (error) {
			if (errorMsg !== '') {
				throw errorMsg;
			} else {
				throw 'Erro interno do servidor. Recarregue a página com F5 e tente novamente. Caso persista, informe ao TI: ' + error;
			}
		}

		if (errorMsg != '') {
			throw errorMsg;
		} else {
			FormController.salvarPainelHistorico('painelValTecSOD', 'dataValTecSOD', 'nomeValTecSOD');

		}
	}

	///////////////////////////////////////////

	_controllerActivityExecutarSolicitacao(formMode, atividade, formView, formController, customizado) {

		$("[name=ti_decisao]").change(function () {
			var valor = $(this).val();
			$("[name=cod_decisao_ti]").val(valor);
		});


		formView.ocultarPainel(
			Painel.SOLICITACAO,
			Painel.SOLICITACAO2,
			Painel.GESTOR_APROVAR,
			Painel.VALIDACAO_TEC,
			Painel.ANALISAR_ACESSOS,


		);



	}

	_ViewActivityExecutarSolicitacao(formMode, atividade, formView, formController) {


		formView.ocultarPainel(
			Painel.SOLICITACAO,
			Painel.SOLICITACAO2,
			Painel.GESTOR_APROVAR,
			Painel.VALIDACAO_TEC,
			Painel.ANALISAR_ACESSOS,


		);
	}

	_validateActivityExecutarSolicitacao() {
		let errorMsg = '';
		let endOfLine = '</br>';
		$('.has-error').removeClass('has-error');

		try {


		} catch (error) {
			if (errorMsg !== '') {
				throw errorMsg;
			} else {
				throw 'Erro interno do servidor. Recarregue a página com F5 e tente novamente. Caso persista, informe ao TI: ' + error;
			}
		}

		if (errorMsg != '') {
			throw errorMsg;
		} else {
			FormController.salvarPainelHistorico('painelTI', 'dataSolicitacao', 'nomeSolicitante');

		}
	}





	///////////////////////////////////////////

	_controllerActivityFim(formMode, atividade, formView, formController) {

		formView.ocultarPainel(

			Painel.SOLICITACAO,
			Painel.SOLICITACAO2,
			Painel.GESTOR_APROVAR,
			Painel.VALIDACAO_TEC,
			Painel.ANALISAR_ACESSOS,
			Painel.EXECUTAR_SOLICITACAO,

		);


	}

	_ViewActivityFim(formMode, atividade, formView, formController) {

		formView.ocultarPainel(
			Painel.SOLICITACAO,
			Painel.SOLICITACAO2,
			Painel.GESTOR_APROVAR,
			Painel.VALIDACAO_TEC,
			Painel.ANALISAR_ACESSOS,
			Painel.EXECUTAR_SOLICITACAO,

		);

	}



}


