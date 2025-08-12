function displayFields(form, customHTML) {
	// Passando parametros para dentro do html
	var today = new Date();
	var year = today.getFullYear();
	var month = (today.getMonth() + 1) < 10 ? '0' + (today.getMonth() + 1) : (today.getMonth() + 1);
	var day = today.getDate() < 10 ? '0' + today.getDate() : today.getDate();
	var hour = today.getHours() < 10 ? '0' + today.getHours() : today.getHours();
	var minute = today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes();
	var second = today.getSeconds() < 10 ? '0' + today.getSeconds() : today.getSeconds();
	var currentHour = hour + ":" + minute + ":" + second;
	var currentDate = day + '/' + month + '/' + year;
	var currentTime = currentDate + "  " + currentHour;
	var atividade = getValue('WKNumState');
	var numProces = getValue("WKNumProces");
	var colleageID = getValue('WKUser');
	var WKCardId = form.getDocumentId();
	var WKFormId = form.getCardIndex();
	var formMode = form.getFormMode();
	var mobile = form.getMobile() ? true : false;
  
	if (atividade == null && numProces == null) {
	  atividade = form.getValue('idAtividade');
	  numProces = form.getValue('idSolicitacao');
	} else {
	  form.setValue('idAtividade', atividade);
	  form.setValue('idSolicitacao', numProces);
	}
  

	
	customHTML.append("<script>function getWKNumState(){ return " + atividade + "; }</script>");
	customHTML.append("<script>function getTodayDate(){ return " + new java.util.Date().getTime() + "; }</script>");
	customHTML.append("<script>function getFormMode(){ return '" + formMode + "'; }</script>");
	customHTML.append("<script>function getUser(){ return '" + colleageID + "'; }</script>");
	customHTML.append("<script>function getCompany(){ return " + getValue("WKCompany") + "; }</script>");
	customHTML.append("<script>");
	customHTML.append("\n   var WKNumState     		=  " + atividade + ";");
	customHTML.append("\n   var WKNumProces     	=  " + numProces + ";");
	customHTML.append("\n   var WKCardId     		=  " + WKCardId + ";");
	customHTML.append("\n   var WKFormId     		=  " + WKFormId + ";");
	customHTML.append("\n   var user	     		= '" + colleageID + "';");
	customHTML.append("\n   var dataAbertura   		= '" + currentTime + "';");
	customHTML.append("\n   var mobile 				= '" + mobile + "';");
	customHTML.append("\n   var formMode 			= '" + formMode + "';");
	customHTML.append("\n   var formController = new FormController(WKNumState, WKNumProces, WKCardId, WKFormId, user, mobile, formMode);");
	customHTML.append("\n </script>");
  
	if (numProces != 0) {
	  form.setValue("idSolicitacao", numProces);
	}
	form.setShowDisabledFields(true);
  
	var cColleagueID = DatasetFactory.createConstraint("colleaguePK.colleagueId", colleageID, colleageID, ConstraintType.MUST);
	var colaborador = DatasetFactory.getDataset("colleague", null, [cColleagueID], null);
	
	
	if(atividade == "0" || atividade == "4"){
	  form.setValue("dataSolicitacao", currentDate) ; 
	  form.setValue("tempoSolicitacao", currentTime) ; 
	  form.setValue("horaSolicitacao", currentHour) ;
	  form.setValue("nomeSolicitante", colaborador.getValue(0, "colleagueName"));  
	  form.setValue("emailSolicitante", colaborador.getValue(0, "mail"));
	  form.setValue("departamentoSolicitante", colaborador.getValue(0, "groupId")); 
	  form.setValue("cargoSolicitante", colaborador.getValue(0, "role")); 
	  form.setValue("IDSolicitante", colleageID);  
	  form.setValue("H_AC_COLLEAGUEID_INFO_AD", colaborador.getValue(0, "loginFluig"));  

	  form.setValue("unidadeArea", "Unidade Solicitante");
	  
	}
  


	if(atividade == "5" ){
	  form.setValue("dataGestor", currentDate) ; 
	  form.setValue("nomeGestor", colaborador.getValue(0, "colleagueName")); 
	  form.setValue("tempoSolicitacao", currentTime) ; 

	}

	
	if(atividade == "16" ){
		form.setValue("dataValTec", currentDate) ; 
		form.setValue("nomeValTec", colaborador.getValue(0, "colleagueName")); 
		form.setValue("tempoSolicitacao", currentTime) ; 
  
	  }
	
	  
	
	if(atividade == "21" ){
		form.setValue("dataValTecSOD", currentDate) ; 
		form.setValue("nomeValTecSOD", colaborador.getValue(0, "colleagueName")); 
		form.setValue("tempoSolicitacao", currentTime) ; 
  
	  }

	  if(atividade == "32" ){
		form.setValue("dataTI", currentDate) ; 
		form.setValue("nomeTI", colaborador.getValue(0, "colleagueName")); 
		form.setValue("tempoSolicitacao", currentTime) ; 
  
	  }
	  
	  
	
	
	
  }
  
  function getCurrentDate() {
	var df = new java.text.SimpleDateFormat("dd/MM/yyyy");
	var cal = java.util.Calendar.getInstance();
	return df.format(cal.getTime());
  }

/*function displayFields(form, customHTML) {
	var ATIVIDADE_ATUAL = getValue("WKNumState");
	var visualizacao = form.getFormMode();

	injetarFuncoesUteisJS(form, customHTML);

	if (ATIVIDADE_ATUAL == INICIO_0 || ATIVIDADE_ATUAL == PRIMEIRA_ATIVIDADE_4) {
		if (visualizacao != "VIEW") {
			configurarDadosSolicitante(form, customHTML);
			dataAprovacao2(form, customHTML)
		}
	}
	if (ATIVIDADE_ATUAL == SUPRIMENTOS_5) {
		if (visualizacao != "VIEW") {
			configurarDadosSolicitante1(form, customHTML);
			dataAprovacao1(form, customHTML)
		}
	}

}
function configurarDadosSolicitante1(form, customHTML) {
	log.info("#### INICIO configurarDadosSolicitante...");

	var matrUser = getValue("WKUser");
	var nomeUser = "";
	var emailUser = "";
	var loginUser = "";

	var fields = [ "colleagueName", "mail", "login" ];
	var c1 = DatasetFactory.createConstraint("colleaguePK.colleagueId",
			matrUser, matrUser, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("colleaguePK.companyId",
			getValue("WKCompany"), getValue("WKCompany"), ConstraintType.MUST);
	var dataset = DatasetFactory.getDataset("colleague", fields, [ c1, c2 ],
			null);
	if (dsTemValor(dataset)) {
		nomeUser = dataset.getValue(0, "colleagueName");
		emailUser = dataset.getValue(0, "mail");
		loginUser = dataset.getValue(0, "login");

		if (temValor(nomeUser) && temValor(emailUser)) {
			form.setValue("nome_aperovador", nomeUser);
		}
	}
}
function configurarDadosSolicitante(form, customHTML) {
	log.info("#### INICIO configurarDadosSolicitante...");

	var matrUser = getValue("WKUser");
	var nomeUser = "";
	var emailUser = "";
	var loginUser = "";

	var fields = [ "colleagueName", "mail", "login" ];
	var c1 = DatasetFactory.createConstraint("colleaguePK.colleagueId",
			matrUser, matrUser, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("colleaguePK.companyId",
			getValue("WKCompany"), getValue("WKCompany"), ConstraintType.MUST);
	var dataset = DatasetFactory.getDataset("colleague", fields, [ c1, c2 ],
			null);
	if (dsTemValor(dataset)) {
		nomeUser = dataset.getValue(0, "colleagueName");
		emailUser = dataset.getValue(0, "mail");
		loginUser = dataset.getValue(0, "login");

		if (temValor(nomeUser) && temValor(emailUser)) {
			form.setValue("nome_solicitante", nomeUser);
			form.setValue("email_solicitante", emailUser);
			form.setValue("login_solicitante", loginUser);
			form.setValue("matricula", matrUser);
		}
	}

	configurarGruposSolicitante(matrUser, form);

	log.info("#### FIM configurarDadosSolicitante...");
}

function configurarGruposSolicitante(matrUser, form) {
	var fields = [ "colleagueGroupPK.groupId" ];
	var c1 = DatasetFactory.createConstraint("colleagueGroupPK.colleagueId",
			matrUser, matrUser, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("colleagueGroupPK.companyId",
			getValue("WKCompany"), getValue("WKCompany"), ConstraintType.MUST);
	var dataset = DatasetFactory.getDataset("colleagueGroup", fields,
			[ c1, c2 ], null);
	if (dsTemValor(dataset)) {
		var resultGrupo = "";
		for (var i = 0; i < dataset.rowsCount; i++) {
			if (i == 0) {
				resultGrupo += dataset.getValue(i, "colleagueGroupPK.groupId");
			} else {
				resultGrupo += ";"
						+ dataset.getValue(i, "colleagueGroupPK.groupId");
			}
		}

		if (resultGrupo != "") {
			form.setValue("grupos_solicitante", resultGrupo);
		}
	}
}

function configurarDadosAtendente(form, customHTML) {
	if (form.getFormMode() == "MOD") {
		var matrUser = getValue("WKUser");
		form.setValue("matr_atendente", matrUser);
	}
}

function injetarFuncoesUteisJS(form, customHTML) {
	log.info("#### INICIO injetarFuncoesUteisJS...");

	customHTML.append("<script>function buscarMatriculaUsuarioLogado(){return "
			+ "'" + getValue("WKUser") + "'" + ";}</script>");
	customHTML.append("<script>function buscarEmpresa(){return "
			+ getValue("WKCompany") + ";}</script>");
	customHTML.append("<script>function buscarAtividadeAtual(){return "
			+ getValue("WKNumState") + ";}</script>");
	customHTML.append("<script>function buscarIdSolicitacao(){return "
			+ getValue("WKNumProces") + ";}</script>");
	customHTML.append("<script> var FORM_MODE = '" + form.getFormMode()
			+ "';</script>");
	customHTML.append("<script> var CURRENT_STATE = '" + getValue("WKNumState")
			+ "';</script>");

	log.info("#### FIM injetarFuncoesUteisJS...");
}

function temValor(valor) {
	if (valor != null && valor != undefined && valor.trim() != "") {
		return true;
	} else {
		return false;
	}
}

function dsTemValor(dataset) {
	if (dataset != null && dataset != undefined && dataset.rowsCount > 0) {
		return true;
	} else {
		return false;
	}
}
function dataAprovacao1(form, customHTML) {
	var data = new Date(), dia = data.getDate().toString(), diaF = (dia.length == 1) ? '0'
			+ dia
			: dia, mes = (data.getMonth() + 1).toString(), // +1 pois no
	// getMonth Janeiro
	// começa com zero.
	mesF = (mes.length == 1) ? '0' + mes : mes, anoF = data.getFullYear();
	var str_data = diaF + "/" + mesF + "/" + anoF;
	form.setValue("data_aperovador", str_data);

}
function configurarDadosAprovador(form, customHTML) {

	var matrUser = getValue("WKUser");
	var nomeUser = "";
	var emailUser = "";
	var loginUser = "";

	var fields = [ "colleagueName", "mail", "login" ];
	var c1 = DatasetFactory.createConstraint("colleaguePK.colleagueId",
			matrUser, matrUser, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("colleaguePK.companyId",
			getValue("WKCompany"), getValue("WKCompany"), ConstraintType.MUST);
	var dataset = DatasetFactory.getDataset("colleague", fields, [ c1, c2 ],
			null);
	if (dsTemValor(dataset)) {
		nomeUser = dataset.getValue(0, "colleagueName");

		if (temValor(nomeUser)) {
			form.setValue("nome_aprovador", nomeUser);
		}
	}

	log.info("#### FIM configurarDadosSolicitante...");
}

function configurarDadosAprovador2(form, customHTML) {

	var matrUser = getValue("WKUser");
	var nomeUser = "";
	var emailUser = "";
	var loginUser = "";

	var fields = [ "colleagueName", "mail", "login" ];
	var c1 = DatasetFactory.createConstraint("colleaguePK.colleagueId",
			matrUser, matrUser, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("colleaguePK.companyId",
			getValue("WKCompany"), getValue("WKCompany"), ConstraintType.MUST);
	var dataset = DatasetFactory.getDataset("colleague", fields, [ c1, c2 ],
			null);
	if (dsTemValor(dataset)) {
		nomeUser = dataset.getValue(0, "colleagueName");

		if (temValor(nomeUser)) {
			form.setValue("nome_aprovador2", nomeUser);
		}
	}

	log.info("#### FIM configurarDadosSolicitante...");
}

function dataAprovacao2(form, customHTML) {
	var data = new Date(), dia = data.getDate().toString(), diaF = (dia.length == 1) ? '0'
			+ dia
			: dia, mes = (data.getMonth() + 1).toString(), // +1 pois no
	// getMonth Janeiro
	// começa com zero.
	mesF = (mes.length == 1) ? '0' + mes : mes, anoF = data.getFullYear();
	var str_data = diaF + "/" + mesF + "/" + anoF;
	form.setValue("data_solicitacao", str_data);

}
	*/