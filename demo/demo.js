const data1 = {
  center: {x: 800, y: 200},
  size: 200,
  color: 'red',
  lineWidth: 20

};

// image coordinate
const data2 = [[400, 400], [500, 400], [600, 500], [500, 600], [400, 600], [300, 500], [400, 400]];

let data3 = {};

// CAMIC is an instance of camicroscope core
// $CAMIC in there
let $CAMIC = null;
// for all instances of UI components
const $UI = {};

const $D = {
  pages: {
    home: '../apps/table.html',
    table: '../apps/table.html'
  },
  params: null // parameter from url - slide Id and status in it (object).
};

// initialize viewer page
function initialize() {
  // init UI -- some of them need to wait data loader to load data
  // because UI components need data to initialize
  initUIcomponents();

  // create a viewer and set up
  initCore();
}

// setting core functionalities
function initCore() {
  // start initial
  // TODO zoom info and mmp
  const opt = {
    hasZoomControl: true,
    hasDrawLayer: true,
    hasLayerManager: true,
    hasScalebar: true,
    hasMeasurementTool: true
  };

  // set states if exist
  if ($D.params.states) {
    opt.states = $D.params.states;
  }

  try {
    $CAMIC = new CaMic("main_viewer", $D.params.slideId, opt);
  } catch (error) {
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }

  $CAMIC.loadImg(function (e) {
    // image loaded
    if (e.hasError) {
      $UI.message.addError(e.message)
    }
  });

  // draw something
  $CAMIC.viewer.addOnceHandler('open', function (e) {
    // ready to draw
    console.log($CAMIC.viewer.omanager);

    //$CAMIC.viewer.omanage.addOverlay();
    $CAMIC.viewer.omanager.addOverlay({id: 'id01', data: data1, render: renderOne, isShow: false});
    $CAMIC.viewer.omanager.addOverlay({id: 'id02', data: data2, render: renderTwo, isShow: true});
    //$CAMIC.viewer.omanager.addOverlay({id: 'id03', data: data3, render: renderThree, isShow: true});
  });
}

function initUIcomponents() {
  // ui init
  $UI.toolbar = new CaToolbar({
    /* opts that need to think of */
    id: 'ca_tools',
    zIndex: 601,
    hasMainTools: false,
    //mainToolsCallback:mainMenuChange,
    subTools: [
      // add
      {
        icon: 'add',// material icons' name
        title: 'Add',
        type: 'btn',// btn/check/dropdown
        value: 'add',
        callback: addOverlay
      },
      // clear
      {
        icon: 'clear',
        title: 'Clear',
        type: 'btn',
        value: 'clear',
        callback: removeOverlay
      },
      // free-line
      {
        icon: 'border_color',// material icons' name
        //icon:'linear_scale',
        title: 'Line',
        type: 'check',
        value: 'line',
        callback: freeLine
      }
      // ,
      // {
      //   icon:'share',
      //   title:'Share View',
      //   type:'btn',
      //   value:'share',
      //   callback:shareURL
      // },
      // {
      //   icon:'view_carousel',
      //   title:'Side By Side Viewer',
      //   value:'dbviewers',
      //   type:'check',
      //   callback:toggleViewerMode
      // }

    ]
  });

}

function addOverlay(data) {
  $CAMIC.viewer.omanager.overlays[0].isShow = true;
  $CAMIC.viewer.omanager.addOverlay({id: 'id02', data: data2, render: renderTwo, isShow: true});
  $CAMIC.viewer.omanager.updateView();
}

function removeOverlay(data) {
  $CAMIC.viewer.omanager.overlays[0].isShow = false;
  $CAMIC.viewer.omanager.removeOverlay('id02');
  $CAMIC.viewer.omanager.updateView();
}

function renderOne(ctx, data) {
  ctx.beginPath();
  ctx.rect(data.center.x, data.center.y, data.size, data.size);
  ctx.lineWidth = data.lineWidth;
  ctx.strokeStyle = data.color;
  ctx.stroke();
  ctx.closePath();
}

// draw polygon
function renderTwo(ctx, data) {
  ctx.beginPath();
  ctx.moveTo(data[0][0], data[0][1]);
  for (var i = 1; i < data.length - 1; i++) {
    ctx.lineTo(data[i][0], data[i][1]);
  }
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'yellow';
  ctx.fillStyle = 'rgba(125,125,125,.4)';
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

}

function renderThree(ctx, data) {
  console.log('data', data);
  ctx.beginPath();
  //ctx.moveTo(prevX, prevY);
  //ctx.lineTo(currX, currY);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
}

// pen draw callback
function freeLine(e){
  if(!$CAMIC.viewer.canvasDrawInstance){
    alert('draw doesn\'t initialize');
    return;
  }
  console.log(e);
  const canvasDraw = $CAMIC.viewer.canvasDrawInstance;
  canvasDraw.drawMode = 'line';
  if(e.checked) {
    canvasDraw.drawOn();
  }else{
    canvasDraw.drawOff();
  }
}

function redirect(url, text = '', sec = 5) {
  let timer = sec;
  setInterval(function () {
    if (!timer) {
      window.location.href = url;
    }

    if (Loading.instance.parentNode) {
      Loading.text.textContent = `${text} ${timer}s.`;
    } else {
      Loading.open(document.body, `${text} ${timer}s.`);
    }
    // Hint Message for clients that page is going to redirect to Flex table in 5s
    timer--;

  }, 1000);
}