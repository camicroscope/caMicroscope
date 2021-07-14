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

//present chance
var present=1;

var promise=[0,0,0,0];

$CAMIC.viewer.addHandler('canvas-click', function(event) {
        // The canvas-click event gives us a position in web coordinates.
        var webPoint = event.position;
    
        // Convert that to viewport coordinates, the lingua franca of OpenSeadragon coordinates.
        var viewportPoint = $CAMIC.viewer.viewport.pointFromPixel(webPoint);
    
        // Convert from viewport coordinates to image coordinates.
        var imagePoint = $CAMIC.viewer.viewport.viewportToImageCoordinates(viewportPoint);
    
        // Show the results.
        console.log(webPoint);
        console.log(webPoint.toString(), viewportPoint.toString(), imagePoint.toString());
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
             console.log(rect);
             console.log('topleft');
             console.log(rect.getTopLeft().x);
             console.log(rect.getTopLeft().y);
             
             console.log('bottomright');
             console.log(rect.getBottomRight().x);
             console.log(rect.getBottomRight().y);
             

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

    var step = localStorage.getItem("register-step");
    if (step !== null){
        document.getElementById('template-button').setAttribute('value',$CAMIC.slideId+"-"+step);
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



                                            }).catch((err)=>{
                                                console.log(err);
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
            console.log(httpPost.responseText);
        }
        else{
            console.log(err);
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
        console.log(image_slideId);
        var coord=coordinates;


        let api_call = $CAMIC.store.getSlide(image_slideId)
                        .then((res)=>{
                           return res;
                        })
                        .catch((err)=>{
                            throw new Error('There is an error occured while running so can you retry the process again!!!');
                        });
        api_call.then((result)=>{
            console.log("in result");
            console.log('coordinates');
            console.log(coord);
            var crop_url="http://localhost:4010/img/IIP/raw/?IIIF="+ result[0].location+"/"+coord["x"]+","+coord["y"]+","+coord["width"]+","+coord["height"]+"/"+coord["imageWidth"]+",/0/default.jpg";
            console.log(crop_url);
            
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
    console.log('done...');
    for(var i=0;i<4;i++){
        promise[i]=0;
    }
    present=chance;
    
    promise[chance]=1;
    coordinates={}
    return true;
}

function formSubmit(form) {
    setTimeout(function() {
        console.log("success...");
        form.submit();
    }, 3000);  // 3 seconds
    return false;
};

//on beforeload
window.onbeforeunload= function(){
    localStorage.setItem("register-step",present);
    

}


var updateButton = document.getElementById('updateDetails');
var favDialog = document.getElementById('favDialog');
var outputBox = document.querySelector('output');
var confirmBtn = document.getElementById('confirmBtn');

// "Update details" button opens the <dialog> modally
updateButton.addEventListener('click', function onOpen() {
if  (typeof favDialog.showModal === "function") {
    favDialog.showModal();
    } else {
    alert("The <dialog> API is not supported by this browser");
}

});
confirmBtn.addEventListener('click',function onSelect(e){
    console.log('conformed');
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
   
    console.log(e);
});
// "Confirm" button of form triggers "close" on dialog because of [method="dialog"]
favDialog.addEventListener('close', function onClose() {
    console.log('close');
    outputBox.value = favDialog.returnValue + " button clicked - " + (new Date()).toString();
    });

function openRegisterview() {
        var features="menubar=yes,location=yes,resizeable=yes,scrollbars=yes,status=no,height=700,width=1200";
        window.open(upload+'/confirm_registration','_blank',features);
}

