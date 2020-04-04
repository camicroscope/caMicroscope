//heatmap.js
//provenance.image.case_id
//x
//y
//footprint
//provenance.analysis.execution_id
//db.mark.createIndex({"provenance.image.case_id": 1, "provenance.analysis.execution_id": 1})
//heatmapdemo.js
// CAMIC is an instance of camicroscope core
// $CAMIC in there
let $CAMIC = null;
// for all instances of UI components
const $UI = {};

const $D = {
  pages:{
    home:'../table.html',
    table:'../table.html'
  },

  //case_id:'TCGA-28-1751-01Z-00-DX1',
  case_id:'PC_227_2_1',
  //exec_id:'lym_v6-high_res'
  //exec_id:'lym_v6-low_res'
  heatData:{
    'lym_v1-high_res':null,
    'lym_v1-low_res':null
  }
  //exec_id:'lym_v1-high_res' 
  //exec_id:'lym_v1-low_res' 

  //algorithms:['lym_v1-high_res'],
  // parameter from url - slide Id and status in it (object).
};
let interval = null;
// initialize viewer page
function initialize(){
  // init UI -- some of them need to wait data loader to load data
  // heatmap: 100 * 100 piexl -> patch
  // web gl

  // because UI components need data to initialize
  createDemoControl();

  // create a viewer and set up
  initCore();
}


// setting core functionalities
function initCore(){
  // start initial
  // TODO zoom info and mmp
  const opt = {
      hasZoomControl:true,
      hasDrawLayer:false,
      hasLayerManager:true,
      hasScalebar:true,
      hasMeasurementTool:true
  }
  // set states if exist
  if($D.params.states){
    opt.states = $D.params.states;
  }


  
  try{
  	let slideQuery = {};
  	slideQuery.id = $D.params.slideId; 
  	$CAMIC = new CaMic("main_viewer", slideQuery, opt);
  }catch(error){
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }

  $CAMIC.loadImg(function(e){
    // image loaded
    if(e.hasError){
      $UI.message.addError(e.message)
    }

    
  });

  // initialize OSD
  $CAMIC.viewer.addOnceHandler('open',function(e){
    var checkImagingHelperIsReady = setInterval(async function () {
      if($CAMIC.viewer.imagingHelper._haveImage) {

        clearInterval(checkImagingHelperIsReady);
        Loading.open(document.body, `Loading Data ...`);

        // load data
        console.time('fetch');
        $D.heatData['lym_v1-high_res'] = await $CAMIC.store.getHeatmap($D.case_id,'lym_v1-high_res').then(d=> d[0]);
        $D.heatData['lym_v1-low_res'] = await $CAMIC.store.getHeatmap($D.case_id,'lym_v1-low_res').then(d=> d[0]);
        console.timeEnd('fetch');
        console.log($D.heatData);
        const exec_id = document.querySelector('.ctrl select').value;
        const inputs = document.querySelectorAll('.ctrl input');
        $D.heatData[exec_id].provenance.analysis.fields[0].threshold = inputs[0].value/100;
        $D.heatData[exec_id].provenance.analysis.fields[1].threshold = inputs[1].value/100;
        console.log(exec_id);
        $CAMIC.viewer.createHeatmap({
          opacity:.8, //inputs[2].value,
          data:$D.heatData[exec_id].data,
          size:$D.heatData[exec_id].provenance.analysis.size,
          fields:$D.heatData[exec_id].provenance.analysis.fields,
          color:"#a50f15"//inputs[3].value
        });
        Loading.close();
        // $CAMIC.store.getHeatmap($D.case_id,$D.exec_id).then(d=>{
        //   console.timeEnd('fetch');
        //   const data = d[0];
        //   data.provenance.analysis.fields[0].threshold = 0.1;
        //   data.provenance.analysis.fields[1].threshold = 0.01;
        //   $CAMIC.viewer.createHeatmap({
        //     opacity:0.8,
        //   	data:data.data,
        //   	size:data.provenance.analysis.size,
        //     fields:data.provenance.analysis.fields
        //   });

        //   Loading.close();
        // });
      }
    }, 500);
    // colors.forEach(color => {
      
    //   rgbToHex(color)
    // });

  });


  // demo control
  
}

// ui control START 
function createDemoControl(){
  // create a control panel
  const panel_template = `
<label>heat exec_id:</label>
<select>
  <option value='lym_v1-high_res'>lym_v1-high_res</option>
  <option value='lym_v1-low_res'>lym_v1-low_res</option>
</select>
<br>
<label>lym:</label><span>10%</span>
<br>
<input type='range' value=10 min=0 max=100 step=0.01 />
<br>
<label>necrosis:</label><span>1%</span>
<br>
<input type='range' value=1 min=0 max=100 step=0.01 />
<br>
<label>opacity:</label><span>0.8</span>
<br>
<input type='range' value=0.8 min=0 max=1 step=0.1 />
<br>
<label>color:</label><span>#1034A6</span>
<br>
<input type="color" id="head"value="#1034A6">
  `;
  

  const panel = document.createElement('div');
  panel.classList.add('ctrl');
  panel.innerHTML = panel_template.trim();
  //
  document.body.appendChild(panel);
  const select = panel.querySelector('select');
  select.addEventListener('change', heatmapChange);

  const inputs = panel.querySelectorAll('input');
  inputs[0].addEventListener('change',lymChange);
  inputs[1].addEventListener('change',necrosisChange);
  inputs[2].addEventListener('change',opacityChange);
  inputs[3].addEventListener('change',colorChange);
  
}
function heatmapChange(e){
  const exec_id = this.value;
  const inputs = document.querySelectorAll('.ctrl input');
  $D.heatData[exec_id].provenance.analysis.fields[0].threshold = inputs[0].value/100;
  $D.heatData[exec_id].provenance.analysis.fields[1].threshold = inputs[1].value/100;
  $CAMIC.viewer.createHeatmap({
    opacity:inputs[2].value,
    data:$D.heatData[exec_id].data,
    size:$D.heatData[exec_id].provenance.analysis.size,
    fields:$D.heatData[exec_id].provenance.analysis.fields,
    color:inputs[3].value
  });  
}
function lymChange(e){
  const spans = document.querySelectorAll('.ctrl span');
  const value = this.value/100;
  spans[0].textContent = `${this.value}%`;
  $CAMIC.viewer.heatmap.setThresholdByName('lym', value);
}
function necrosisChange(e){
  const spans = document.querySelectorAll('.ctrl span');
   const value = this.value/100;
  spans[1].textContent = `${this.value}%`;
  $CAMIC.viewer.heatmap.setThresholdByName('necrosis', value);
}
function opacityChange(e){
  const spans = document.querySelectorAll('.ctrl span');
  spans[2].textContent = this.value;
  $CAMIC.viewer.heatmap.setOpacity(this.value);
}

function colorChange(e){
  const spans = document.querySelectorAll('.ctrl span');
  spans[3].textContent = this.value;
  clearTimeout(interval);
  // debounce
  interval = setTimeout(function(){
    $CAMIC.viewer.heatmap.setColor(this.value);
  }.bind(this),300);  
  
}
// ui control END


