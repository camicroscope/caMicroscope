$(document).ready(function() {

	$('#submitbtn').click( function () {
	
		var viewer = getParameterByName("viewer");
		var agelt = $('#input01').val();
		var agegt = $('#input02').val();
		var pathstage = $('#select05').val();
		var histology = $('#select04').val();
		var surgery = $('#select03').val();
		var vitalstate = $('#select01').val();
		var tumorstatus = $('#select02').val();
		var url = "csv2Json.html?tableView=TCGABreast";
		if(agelt != "")
			url += "&LessThan=" + agelt;
		if(agegt != "")
			url += "&GreaterThan=" + agegt;
		if(tumorstatus != "Either")
			url += "&person_neoplasm_cancer_status=" + tumorstatus;
		if(histology != "Any")
			url += "&histological_type=" + histology;
		if(surgery != "Any")
			url += "&surgical_procedure=" + surgery;
		if(vitalstate != "Either")
			url += "&vital_status=" + vitalstate;
		if(pathstage != "Any")
			url += "&pathologic_stage=" + pathstage;
			
		url += "&viewer=" + viewer;
		window.open(url);	
		})		 
	});
	
	function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
