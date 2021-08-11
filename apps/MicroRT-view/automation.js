const params = getUrlVars();

const slideQuery={}
const options={
    homeFillsViewer:true,
};
slideQuery.id=params.slideId;

//camic slide object
var $CAMIC=new CaMic('wsi_view',slideQuery,options);

$CAMIC.loadImg();


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
    localStorage.setItem('wsi-x',imagePoint['x']);
    localStorage.setItem('wsi-y',imagePoint['y']);


    document.getElementsByName('wsi-x-coord')[0].innerHTML=localStorage.getItem('wsi-x');
    document.getElementsByName('wsi-y-coord')[0].innerHTML=localStorage.getItem('wsi-y');
    document.getElementById('x-coord-wsi').setAttribute('value',localStorage.getItem('wsi-x'));
    document.getElementById('y-coord-wsi').setAttribute('value',localStorage.getItem('wsi-y'));

    
});

var stream=null;
var upload=null;
window.onload = async function(){
    var data1=localStorage.getItem('wsi-x');
    var data2=localStorage.getItem('wsi-y');

    var data3=localStorage.getItem('stage-x');
    var data4=localStorage.getItem('stage-y');

    if(data1 !== null){
        document.getElementsByName('wsi-x-coord')[0].innerHTML=localStorage.getItem('wsi-x');
        document.getElementById('x-coord-wsi').setAttribute('value',localStorage.getItem('wsi-x'));
    }
    else{
        document.getElementsByName('wsi-x-coord')[0].innerHTML = 0;
    }
    if(data2 !== null){
        document.getElementsByName('wsi-y-coord')[0].innerHTML=localStorage.getItem('wsi-y');
        document.getElementById('y-coord-wsi').setAttribute('value',localStorage.getItem('wsi-y'));
    }
    else{
        document.getElementsByName('wsi-y-coord')[0].innerHTML = 0;
    }
    if(data3 !== null){
        document.getElementsByName('stage-x-coord')[0].innerHTML = data3;
    }
    else{
        document.getElementsByName('stage-x-coord')[0].innerHTML = 0;
    }
    if(data4 !== null){
        document.getElementsByName('stage-y-coord')[0].innerHTML = data4;
    }
    else{
        document.getElementsByName('stage-y-coord')[0].innerHTML = 0;
    }

    var textfield2 = document.createElement("input");
    textfield2.setAttribute('type','hidden');
    textfield2.setAttribute('name','redirect_to');
    textfield2.setAttribute('value',window.location.href);
    document.getElementById("transform").appendChild(textfield2);



    var ip_config=  $CAMIC.store.getConfigByName("3D_printed_microscope_config_details").
                                                    then((list)=>{
                                                        var data=list[0];
                                                        web_stream=data.configuration[0].url;
                                                        upload=data.configuration[1].url;
                                                        document.getElementById('display-section').setAttribute('data',web_stream+"/");
                                                        document.getElementById('transform').setAttribute('action',upload+"/final_confirmation");

                                                    }).catch((err)=>{
                                                        console.log(err);
                                                    });

    

                                                                  
};

var move=document.getElementById('move_lens_position');
const loader=document.querySelector('#loading-message');
move.addEventListener('click', async() =>{
    console.log('occured');
    let data =null;
    try{
        displayloading();
        data=await get_the_coordinates();
        localStorage.setItem('stage-x',data['stage_x']);
        localStorage.setItem('stage-y',data['stage_y']);
        hideloading();
        window.location.reload();
    }
    catch(e){
        console.log("Error!");
        console.log(e);
    }
    console.log(data);

});
async function get_the_coordinates(){
    let url=upload+"/return_calculated_coordinates/";
    const response = await fetch(url);
    const  new_coordi= await response.json();
    return new_coordi;
}

function displayloading(){
    loader.classList.add('display');
}
function hideloading(){
    loader.classList.remove('display');
}


