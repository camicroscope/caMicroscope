var Modal = new Class({
	initialize: function(options)
	{
	},
	
	closeModal:function()
	{
		//FadeOut Modal - Remove From DOM
		//$('#modal_').fadeOut();
		$('modal_').dispose();
	},
	
	buildModal:function()
	{
		//Initial Modal Form : No Data
	if(typeof jsonData === 'undefined')
	{

	//Form Legend Name
	var form_name = 'Describe Markup';
	var modal_build = '';
	
	//Set Keys for FORM Element name attr
	var drop_key = 'TissueType';
 	var radio_key = 'ReviewerName';
 	var chk_key = 'Check_';
 	var text_key = 'PathReport';

	//Init Container
 	modal_build += '<div id="modal_">';
 	modal_build += '<form action="#" method="" id="the_form">';
 	modal_build += '<fieldset>';
 	//FORM Display Name
 	modal_build += '<legend>' + form_name + '</legend>';

 //////////   User Customization Starts here /////////

		//Form Element Start
		//Select List
	 	modal_build += '<div class="row">';
	 	modal_build += '<div class="left_">';
	 	modal_build += '<label>' + drop_key +'</label>';
	 	modal_build += '</div>';
	 	modal_build += '<div class="right_">';
		// Start Select List
	 	modal_build += '<select name="' + drop_key +'" id="' +  drop_key + '">';
	 	//Set options - {"Form Value" : "Display Value"}
	 	var select_options = {"":"Please Select", "Oligo":"Oligocytoma", "Astro":"Astrocytoma", "Mixed":"Mixed Oligocytoma and Astrocytoma"};
		
		Object.each(select_options, function(val , key){
			modal_build += "<option value='" + key + "'>" + val + "</option>";
		});
		
		modal_build += '</select>';
		modal_build += '</div>';
	 	modal_build += '</div>';
	 	//Form Element End

		
		//Form Element Start
	 	//Radio BUttons
	 	modal_build += '<div class="row">';
	 	modal_build += '<div class="left_">';
	 	modal_build += '<label>' + radio_key +'</label>';
	 	modal_build += '</div>';
	 	modal_build += '<div class="right_">';
	 	//Set options - {"Form Value" : "Display Value"}
		var radio_options = {"Dan Brat":"Dan Brat", "Jose Galvez":"Jose Galvez", "Joel Saltz":"Joel Saltz"};
		// Start Radio BUttons
		
		Object.each(radio_options, function(val , key){
		  modal_build += '<label class="radio">';
		  modal_build += ' <input type="radio" name="' + radio_key + '" id="" value="' + key + '">'+ val;
		  modal_build += '</label>';
		});
	 	modal_build += '</div>';
	 	modal_build += '</div>';
	 	//Form Element End


	 	//Form Element Start
	 	//Check Boxes
	 	modal_build += '<div class="row">';
	 	modal_build += '<div class="left_">';
	 	modal_build += '<label>' + chk_key +'</label>';
	 	modal_build += '</div>';
	 	modal_build += '<div class="right_">';
	 	//Set options - {"Form Value" : "Display Value"}
	 	var chkbox_options = {"check_1":"Check 1", "check_2":"Check 2", "check_3":"Check 3"};
	 	// Start Check Boxes
	 	
	 	Object.each(chkbox_options, function(val , key){
		  modal_build += '<label class="checkbox">';
	 	  modal_build += '<input type="checkbox" value="' + key + '" name="' + chk_key +'">' + val ;
	 	  modal_build += ' </label>';
		});
	 	modal_build += '</div>';
	 	modal_build += '</div>';
	 	//Form Element End


	 	//Form Element Start
	 	//TextArea
	 	modal_build += '<div class="row">';
	 	modal_build += '<div class="left_">';
	 	modal_build += '<label>' + text_key +'</label>';
	 	modal_build += '</div>';
	 	modal_build += '<div class="right_">';
	 	//TextArea Start
	 	modal_build += '<textarea rows="3" name="' +  text_key + '"></textarea><br />';
	 	modal_build += '</div>';
	 	modal_build += '</div>';
	 	//Form Element End

	//////////   User Customization Ends here /////////

	//Buttons
 	modal_build += '<div class="buttons_">';
 	modal_build += '<button type="button" id="the_button" class="btn">Submit</button>';
 	modal_build += '<a href="#" class="btn close_modal">Cancel</a>';
 	modal_build += '</div>';

 	modal_build += '</fieldset>';
 	modal_build += '</form>';
 	modal_build += '</div>';
 	}

 	//Modal Form : With JSON Data
	else if(typeof jsonData !== 'undefined')
	{

	var listData = JSON.encode(jsonData);

	//Form Legend Name
	var form_name = 'Describe Markup';
	var modal_build = '';

	//Set Keys for FORM name attr
	var drop_key = 'TissueType';
 	var radio_key = 'ReviewerName';
 	var chk_key = 'Check_';
 	var text_key = 'PathReport';

	//Set values for based on JSON
	select_val = listData.TissueType;
	radio_val = listData.ReviewerName;
	check_val = listData.Check_;
	text_val = listData.PathReport;

	
	//Init Container
 	modal_build += '<div id="modal_">';
 	modal_build += '<form action="#" method="" id="the_form">';
 	modal_build += '<fieldset>';
 	//Form Dispay Name
 	modal_build += '<legend>' + form_name + '</legend>';
	
//////////   User Customization Starts here /////////

 		//Form Element Start
	 	//Select List
	 	modal_build += '<div class="row">';
	 	modal_build += '<div class="left_">';
	 	modal_build += '<label>' + drop_key +'</label>';
	 	modal_build += '</div>';
	 	modal_build += '<div class="right_">';
	 	modal_build += '<select name="' + drop_key +'" id="' +  drop_key + '">';
	 	//Set options - {"Form Value" : "Display Value"}
	 	var select_options = {"":"Please Select", "Oligo":"Oligocytoma", "Astro":"Astrocytoma", "Mixed":"Mixed Oligocytoma and Astrocytoma"};
	 	// Start Select List
		Object.each(select_options, function(val, key) {
		  if(select_val == key){
		  modal_build += "<option value='" + key + "' selected>" + val + "</option>";
		  	}
		  else{
		  	modal_build += "<option value='" + key + "'>" + val + "</option>";
		  	}
		});
		modal_build += '</select>';
		modal_build += '</div>';
	 	modal_build += '</div>';
	 	//Form Element End

	 	//Form Element Start
	 	//Radio Buttons
	 	modal_build += '<div class="row">';
	 	modal_build += '<div class="left_">';
	 	modal_build += '<label>' + radio_key +'</label>';
	 	modal_build += '</div>';
	 	modal_build += '<div class="right_">';
	 	//Set options - {"Form Value" : "Display Value"}
		var radio_options = {"Dan Brat":"Dan Brat", "Jose Galvez":"Jose Galvez", "Joel Saltz":"Joel Saltz"};
		// Radio BUttons Start
		Object.each(radio_options, function(val, key) {
		  if(radio_val == key){
		  modal_build += '<label class="radio">';
		  modal_build += ' <input type="radio" name="' + radio_key + '" id="" value="' + key + '" checked>'+ val;
		  modal_build += '</label>';
		  	}
		  else{
		  modal_build += '<label class="radio">';
		  modal_build += ' <input type="radio" name="' + radio_key + '" id="" value="' + key + '">'+ val;
		  modal_build += '</label>';
		  	}
		});
	 	modal_build += '</div>';
	 	modal_build += '</div>';
	 	//Form Element End

	 	
	 	//Form Element Start
	 	//Check Boxes
	 	modal_build += '<div class="row">';
	 	modal_build += '<div class="left_">';
	 	modal_build += '<label>' + chk_key +'</label>';
	 	modal_build += '</div>';
	 	modal_build += '<div class="right_">';
	 	//Set options - {"Form Value" : "Display Value"}
	 	var chkbox_options = {"check_1":"Check 1", "check_2":"Check 2", "check_3":"Check 3"};
		// Checkboxes Start
		Object.each(chkbox_options, function(val, key) {
			var chklength = check_val.length;  
			var is_checked = '';
			modal_build += '<label class="checkbox">';         
			for(i=0;i< chklength;i++)
			{
			   if(check_val[i] == key)
			   {
			     is_checked = 'checked';
			   }
			} 
			modal_build += '<input type="checkbox" value="' + val + '" name="' + chk_key +'"' + is_checked +'>'+ val; 
		     modal_build += ' </label>';
		 })
	 	modal_build += '</div>';
	 	modal_build += '</div>';
	 	//Form Element End

		//Form Element Start
	 	//TextArea
	 	modal_build += '<div class="row">';
	 	modal_build += '<div class="left_">';
	 	modal_build += '<label>' + text_key +'</label>';
	 	modal_build += '</div>';
	 	modal_build += '<div class="right_">';
	 	// Textarea Start
	 	modal_build += '<textarea rows="3" name="' +  text_key + '">' + text_val + '</textarea><br />';
	 	modal_build += '</div>';
	 	modal_build += '</div>';
	 	//Form Element End

//////////   User Customization Starts here /////////

	//Buttons
 	modal_build += '<div class="buttons_">';
 	modal_build += '<button type="button" id="the_button" class="btn">Submit</button>';
 	modal_build += '<a href="#" class="btn close_modal">Cancel</a>';
 	modal_build += '</div>';

 	modal_build += '</fieldset>';
 	modal_build += '</form>';
 	modal_build += '</div>';


	}	

	//Append Modal to Body
	var modal_element = Elements.from(modal_build);
	modal_element.inject(document.body);
    //$('#modal_').fadeIn();

    			//Form Submission
     			//$('the_button').addEvent('click',function() {
					//$('#modal_').fadeOut();
					//Set JSON
			//		var formObjects=$('the_form').toQueryString().parseQueryString();
			//		var jsonData = JSON.encode(formObjects);
					//jsonData = JSON.stringify($('#the_form').serializeObject());
					//Remove Modal From DOM
                  //  $('modal_').dispose();
                //});

                //$("close_modal").addEvent('click',function(){
                 //   closeModal();
                //});
	}
});
