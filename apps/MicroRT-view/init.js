//const Store = require("../../core/Store");

//get slide Id from URL
const params = getUrlVars();

const slideQuery={}
const options={
    homeFillsViewer:true,
};
slideQuery.id=params.slideId;

//camic slide object
var $CAMIC=new CaMic('parent2',slideQuery,options);

//server address locations
var web_stream=null;
var upload=null;

//client address location
var client=null;



//load Slide
$CAMIC.loadImg();
var p;

//var for enabling crop
var enable_crop=0;
var coordinates={};


$CAMIC.viewer.addHandler('canvas-click', function(event) {
        // The canvas-click event gives us a position in web coordinates.
        var webPoint = event.position;
    
        // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
        var viewportPoint = $CAMIC.viewer.viewport.pointFromPixel(webPoint);
    
        // Convert from viewport coordinates to image coordinates.
        var imagePoint = $CAMIC.viewer.viewport.viewportToImageCoordinates(viewportPoint);
    
        // Show the results.
        //console.log(webPoint);
        //console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.toString());
    });
    //selection.disable();
    //selection.toggleState();
   
    var selection = $CAMIC.viewer.selection({
       // toggleButton: 'toggle-selection',
        restrictToImage: true,
        showConfirmDenyButtons:  true,
        styleConfirmDenyButtons: true,
        returnPixelCoordinates:  true,
        prefixUrl: '../../core/openseadragon/images/',
        onSelection: function(rect){
             //console.log(rect);
             //console.log('topleft');
             //console.log(rect.getTopLeft().x);
            //  console.log(rect.getTopLeft().y);
             
            //  console.log('bottomright');
            //  console.log(rect.getBottomRight().x);
            //  console.log(rect.getBottomRight().y);
             

             //Information regarding the croped size
            coordinates={
                "x":rect.getTopLeft().x,
                "y":rect.getTopLeft().y,
                "width":rect.width,
                "height":rect.height,
                "imageWidth": Math.max(rect.height,rect.width)
            };

           
        }
    });
   
    function enable_opeation(){
        
        if(enable_crop==0){
            selection.enable();
            enable_crop=1;
        }
        else{
            selection.disable();
            enable_crop=0;
        }
}

function openLink() {
    var features="menubar=yes,location=yes,resizeable=yes,scrollbars=yes,status=no,height=700,width=700";
    window.open(web_stream+'/','_blank',features);
}



window.onload= function(){
    //stage
    document.getElementById("stage_1").value = $CAMIC.slideId+"_stage_1";
    document.getElementById("stage_2").value = $CAMIC.slideId+"_stage_2";
    document.getElementById("stage_3").value = $CAMIC.slideId+"_stage_3"; 


    //stage
    var textfield = document.createElement("input");
    textfield.setAttribute('type','hidden');
    textfield.setAttribute('name','find_it');
    textfield.setAttribute('value',window.location.href);
    document.getElementById("stage_form").appendChild(textfield);

    //wsi
    var textfield1 = document.createElement("input");
    textfield1.setAttribute('type','hidden');
    textfield1.setAttribute('name','wsi_file');
    textfield1.setAttribute('id','wsi_file');
    document.getElementById("wsi_form").appendChild(textfield1);

    var textfield2 = document.createElement("input");
    textfield2.setAttribute('type','hidden');
    textfield2.setAttribute('name','redirect_to');
    textfield2.setAttribute('value',window.location.href);
    document.getElementById("wsi_form").appendChild(textfield2);

    var textfield3=document.createElement("input");
    textfield3.setAttribute('type','hidden');
    textfield3.setAttribute('name','information');
    textfield3.setAttribute('id','image_data');
    document.getElementById('wsi_form').appendChild(textfield3);

    

    var step1 = localStorage.getItem("register-step1");
    var step2 = localStorage.getItem('register-step2');
    if (step1 !== null && step2 !== null && step1===step2){
        document.getElementById('template-button').setAttribute('value',$CAMIC.slideId+"-"+step1);
    }

    //Status data
    //coordinates-1
    var wsi_1_x=localStorage.getItem('wsi_1_x');
    var wsi_1_y=localStorage.getItem('wsi_1_y');
    var stage_1_x=localStorage.getItem('stage_1_x');
    var stage_1_y=localStorage.getItem('stage_1_y');
    var status_1=localStorage.getItem('status-1');

    console.log("printing data");
    console.log(stage_1_x);

    if(wsi_1_x!==null){document.getElementsByName('wsi_1_x')[0].innerHTML=wsi_1_x;}
    if(wsi_1_y!==null)document.getElementsByName('wsi_1_y')[0].innerHTML=wsi_1_y;
    if(stage_1_x!==null)document.getElementsByName('stage_1_x')[0].innerHTML=stage_1_x;
    if(stage_1_y!==null)document.getElementsByName('stage_1_y')[0].innerHTML=stage_1_y;
    if(status_1!==null && status_1==="true"){
        $("#status-1").removeClass("bg-danger");
        $("#status-1").addClass("bg-success");
        document.getElementById('status-1').innerHTML="COMPLETED";
    }
    else{
        $("#status-1").removeClass("bg-success");
        $("#status-1").addClass("bg-danger");
        console.log("inside the incomplete");
        document.getElementById('status-1').innerHTML="INCOMPLETE";
    }

    //coordinates-2
    var wsi_2_x=localStorage.getItem('wsi_2_x');
    var wsi_2_y=localStorage.getItem('wsi_2_y');
    var stage_2_x=localStorage.getItem('stage_2_x');
    var stage_2_y=localStorage.getItem('stage_2_y');
    var status_2=localStorage.getItem('status-2');

    if(wsi_2_x!==null){document.getElementsByName('wsi_2_x')[0].innerHTML=wsi_2_x;}
    if(wsi_2_y!==null)document.getElementsByName('wsi_2_y')[0].innerHTML=wsi_2_y;
    if(stage_2_x!==null)document.getElementsByName('stage_2_x')[0].innerHTML=stage_2_x;
    if(stage_2_y!==null)document.getElementsByName('stage_2_y')[0].innerHTML=stage_2_y;
    if(status_2!==null && status_2==="true"){
        $("#status-2").removeClass("bg-danger");
        $("#status-2").addClass("bg-success");
        document.getElementById('status-2').innerHTML="COMPLETED";
    }
    else{
        $("#status-2").removeClass("bg-success");
        $("#status-2").addClass("bg-danger");
        document.getElementById('status-2').innerHTML="INCOMPLETE";
    }


    //coordinates-3
    var wsi_3_x=localStorage.getItem('wsi_3_x');
    var wsi_3_y=localStorage.getItem('wsi_3_y');
    var stage_3_x=localStorage.getItem('stage_3_x');
    var stage_3_y=localStorage.getItem('stage_3_y');
    var status_3=localStorage.getItem('status-3');

    if(wsi_3_x!==null){document.getElementsByName('wsi_3_x')[0].innerHTML=wsi_3_x;}
    if(wsi_3_y!==null)document.getElementsByName('wsi_3_y')[0].innerHTML=wsi_3_y;
    if(stage_3_x!==null)document.getElementsByName('stage_3_x')[0].innerHTML=stage_3_x;
    if(stage_3_y!==null)document.getElementsByName('stage_3_y')[0].innerHTML=stage_3_y;
    if(status_3!==null && status_3==="true"){
        $("#status-3").removeClass("bg-danger");
        $("#status-3").addClass("bg-success");
        document.getElementById('status-3').innerHTML="COMPLETED";
    }
    else{
        $("#status-3").removeClass("bg-success");
        $("#status-3").addClass("bg-danger");
        document.getElementById('status-3').innerHTML="INCOMPLETE";
    }



    var c=new Store();
    var ip_config=  $CAMIC.store.getConfigByName("3D_printed_microscope_config_details").
                                            then((list)=>{
                                                var data=list[0];
                                                web_stream=data.configuration[0].url;
                                                upload=data.configuration[1].url;
                                                client=data.configuration[2].url;

                                                document.getElementById('stage_form').setAttribute('action',web_stream+"/take_stage_image");
                                                document.getElementById('wsi_form').setAttribute('action',upload+"/take_wsi_image");
                                                document.getElementById('dialog-id').setAttribute('action',upload+"/");
                                                document.getElementById('register-id').setAttribute('action',upload+"/template_matching");
                                                //document.getElementById('final-submission').setAttribute('action',upload+"/final_confirmation");

                                            }).catch((err)=>{
                                                //console.log(err);
                                            })
    


  
   
}


var getBase64FromImageUrl = function(url){
    var img=new Image();
    img.setAttribute('crossOrigin','anonymous');

    img.onload= function(){
        var canvas=document.createElement("canvas");
        canvas.width=this.width;
        canvas.height=this.height;

        var ctx=canvas.getContext("2d");
        ctx.drawImage(this,0,0);

        var dataUrl=canvas.toDataURL("image/jpg");
        document.getElementById("wsi_file").setAttribute('value',dataUrl);


    }
    img.src=url;
};
var sendBase64ToServer = function(name,base64){
    var httpPost=new XMLHttpRequest(),
    path=web_stream+"/take_wsi_image/"+name,
    data=JSON.stringify({image: base64});
    httpPost.onreadystatechange = function(err){
        if(httpPost.readyState==4 && httpPost.status==200){
           // console.log(httpPost.responseText);
        }
        else{
           // console.log(err);
        }
    };
    httpPost.open("POST",path,true);
    httpPost.setRequestHeader('Content-Type','application/json');
    
    httpPost.send(data);

};

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
function register(chance){
    
    if(!isEmpty(coordinates)){
        document.getElementById('image_data').setAttribute('value',coordinates['x'].toString()+"-"+coordinates['y'].toString()+"-"+coordinates['imageWidth'].toString()+"-"+coordinates['height'].toString()+"-"+$CAMIC.slideId+"_wsi_"+chance.toString());
        var image_slideId=$CAMIC.slideId;
        //console.log(image_slideId);
        var coord=coordinates;


        let api_call = $CAMIC.store.getSlide(image_slideId)
                        .then((res)=>{
                           return res;
                        })
                        .catch((err)=>{
                            throw new Error('There is an error occured while running so can you retry the process again!!!');
                        });
        api_call.then((result)=>{
            // console.log("in result");
            // console.log('coordinates');
            // console.log(coord);
            var crop_url="http://localhost:4010/img/IIP/raw/?IIIF="+ result[0].location+"/"+coord["x"]+","+coord["y"]+","+coord["width"]+","+coord["height"]+"/"+coord["imageWidth"]+",/0/default.jpg";
            // console.log(crop_url);
            
            var send_crop_url=client+"/img/IIP/raw/?IIIF="+ result[0].location+"/"+coord["x"]+","+coord["y"]+","+coord["width"]+","+coord["height"]+"/"+coord["imageWidth"]+",/0/default.jpg";

            document.getElementById("wsi_file").setAttribute('value',send_crop_url);

        //getBase64FromImageUrl(crop_url);

        }).catch((error)=>{
            alert(error);
        });

    }
    else{
        alert("Please select the Region of interest")
    }
    // console.log('done...');

    //register-step2
    localStorage.setItem('register-step2',chance);

    coordinates={}

    document.getElementById('preview-section').setAttribute('src',upload+"/preview_two_images/");

    return true;
}

function formSubmit2(form) {
    setTimeout(function() {
    // console.log("success...");
        form.submit();
    }, 3000);  // 3 seconds
    return false;
};

//on beforeload
// window.onbeforeunload= function(){
//     localStorage.setItem("register-step",present);
    

// }


var updateButton = document.getElementById('updateDetails');
var favDialog = document.getElementById('favDialog');
var outputBox = document.querySelector('output');
var confirmBtn = document.getElementById('confirmBtn');

// "Update details" button opens the <dialog> modally
updateButton.addEventListener('click', function onOpen() {
    // var iframe = document.createElement('iframe');
    // iframe.setAttribute("height", "825px");
    // iframe.setAttribute("width", "410px");
    // iframe.setAttribute('src',upload+"/preview_two_images/");
    // iframe.setAttribute('scrolling',"yes");
    // iframe.setAttribute('id','preview-section');
    // document.getElementById("dialog-id").appendChild(iframe);   
    //document.getElementById('preview-section').setAttribute('src',upload+"/preview_two_images/");
    //var iframe=document.getElementById('preview-section');
    //console.log(iframe);
    //iframe.src = iframe.src;

   // $('#preview-section').load("http://192.168.29.6:3000/sending_images/");

   var c=document.getElementById('preview-section');
   document.getElementById("preview-section").innerHTML='<iframe src= '+ `${upload+"/preview_two_images/"}`+ ' height="410" width="825" scrolling="no"></iframe>';

    
if  (typeof favDialog.showModal === "function") {
    favDialog.showModal();
    } else {
    alert("The API is not supported by this browser");
}

});
confirmBtn.addEventListener('click',async function onSelect(e){
    console.log('conformed');
    
    //    var elem = document.getElementById('preview-section');
    //    elem.parentNode.removeChild(elem);

   //document.getElementById('preview-section').setAttribute('src','');

  await fetchcoordinatesJSON().then(data => {
    console.log("inside");
    console.log(data);
    sessionStorage.removeItem('itemName');
    localStorage.setItem(`wsi_${data['step']}_x`,data['wsi_x']);
    localStorage.setItem(`wsi_${data['step']}_y`,data['wsi_y']);
    localStorage.setItem(`stage_${data['step']}_x`,data['stage_x']);
    localStorage.setItem(`stage_${data['step']}_y`,data['stage_y']);
    localStorage.setItem(`status-${data['step']}`,data['status']);
    window.location.reload();
  });
   


    var flag=0;
    for(var i=0;i<4;i++){
        if(promise[i]==1){
            flag=i;break;
        }
    }
    if(flag==0){
        alert('Please select region of interest before performing registration');
    }
    else{
        document.getElementById('confirmBtn').setAttribute('value',$CAMIC.slideId.toString()+"_"+flag.toString());
    }
   
    // console.log(e);
});
// "Confirm" button of form triggers "close" on dialog because of [method="dialog"]
favDialog.addEventListener('close', function onClose() {
    //document.getElementById('preview-section').setAttribute('src','');

//    var elem = document.getElementById('preview-section');
//     elem.parentNode.removeChild(elem);

    console.log('close');
    outputBox.value = favDialog.returnValue + " button clicked - " + (new Date()).toString();
    });

function openRegisterview() {

        var features="menubar=yes,location=yes,resizeable=yes,scrollbars=yes,status=no,height=700,width=1200";
        window.open(upload+'/confirm_registration/','_blank',features);
}

// var thisIframe = $('#preview-section');
// var loaded = false;
// function onFrameLoad() {
//     if ($(thisIframe).attr('src')) {
//         loaded = true;
//         clearInterval(viewerFrame);
//         thisIframe.removeClass('removeDisplay');
//         $('.loading-container').addClass('removeDisplay');
//     }
// }
// var viewerFrame = setInterval(function(){
//     reload();
// }, 6000);
// var currentState = $(thisIframe).attr('src');
// if (!currentState) {
//     clearInterval(viewerFrame);
// }
// function reload() {
//     currentSrc = $(thisIframe).attr('src');
//     function removeSrc() {
//         $(thisIframe).attr('src', '');
//     }
//     setTimeout (removeSrc, 100);
//     function replaceSrc() {
//         $(thisIframe).attr('src', currentSrc);
//     }
//     setTimeout (replaceSrc, 200);
// }


// async function fetchcoordinatesJSON() {
//     console.log("function called");
//     const response = await fetch('http://192.168.29.6:3000/get_coordinates_data/');
//     console.log("response confirmed");
//     const movies = await response.json();
//     return movies;
//   }

async function fetchcoordinatesJSON() {
    const response=await fetch(upload+"/get_coordinates_data/");

    console.log("data received!");

    var data= await response.json();
    return data;
}


//before stage submission
function stage(step){
    console.log(step);
    var c=confirm('Are you sure, with this image?');

    if(c===true){
        //register-step1
        localStorage.removeItem(`status-${step}`);
        localStorage.removeItem('register-step2');
        localStorage.removeItem(`wsi_${step}_x`);
        localStorage.removeItem(`wsi_${step}_y`);
        localStorage.removeItem(`stage_${step}_x`);
        localStorage.removeItem(`stage_${step}_y`);
        localStorage.setItem('register-step1',step);
    }
    return c;
}

//before registration
$('#register-id').submit(function(){
    var step1=localStorage.getItem('register-step1');
    var step2=localStorage.getItem('register-step2');

    console.log(step1);
    console.log(step2)

    localStorage.removeItem('register-step1');
    localStorage.removeItem('register-step2');
    if(step1 !== null && step2 !== null && step1===step2){
        return true;
    }
    else if(step1 !== null && step2 !== null && step1 !== step2){
        alert(`Both are of different sets where stage is from set- ${step1} and wsi is from set- ${step2}`);
        return false;
    }
    else{
        alert('Make sure you have taken region of interest from both the views');
        return false;
    }

});

//before final submission
// $('#final-submission').submit(async function(){
//     var confi=confirm('Are you sure, with this values?');
//     var data1=localStorage.getItem('status-1');
//     var data2=localStorage.getItem('status-2');
//     var data3=localStorage.getItem('status-3');
//     console.log(confi)
//     if(confi===true && data1==='true' && data2==='true' && data3==='true'){
//         await automation();
//         return true;
//     }
//     else{
//         alert(`-> anchor-1 : ${data1==='true'?"COMPLETED": "NOT COMPLETED"}\n-> anchor-2 : ${data2==='true'?"COMPLETED": "NOT COMPLETED"}\n-> anchor-3 : ${data3==='true'?"COMPLETED": "NOT COMPLETED"}\n `);
//         return false;
//     }
// });

//opening new page for both views
function check_values(){
    var confi=confirm('Are you sure, with this values?');
    var data1=localStorage.getItem('status-1');
    var data2=localStorage.getItem('status-2');
    var data3=localStorage.getItem('status-3');
    console.log(confi)
    if(confi===true && data1==='true' && data2==='true' && data3==='true'){
        window.location.href = `./automation.html?slideId=${$CAMIC.slideId}`;
        return true;
    }
    else{
        alert(`-> anchor-1 : ${data1==='true'?"COMPLETED": "NOT COMPLETED"}\n-> anchor-2 : ${data2==='true'?"COMPLETED": "NOT COMPLETED"}\n-> anchor-3 : ${data3==='true'?"COMPLETED": "NOT COMPLETED"}\n `);
        //window.location.href = `./automation.html?slideId=${$CAMIC.slideId}`;
        return false;

    }
}

