function test() {
  console.log('result', getVisualizationData);
};

async function initialize() {
  // クエリパラメータからIDを取得する関数
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  // 取得したIDを使ってコンテンツを表示する
  const slideId = getQueryParam('slideId');

  const store = new Store('../data/');
  try {
    const data = await store.findSlide();
    if (data.length == 0) {
      var div = document.querySelector('.container');
      div.textContent = `No Data Found ... x _ x`;
      div.classList = `text-center p-4`;
      return;
    }
    for (var i = 0; i < data.length; i++) {
      const JSONdata={};
      JSONdata.id=data[i]._id.$oid;
      JSONdata.name=data[i].name;
      JSONdata.displayed=true;
      if (data[i].filter) {
        JSONdata.filterList = JSON.parse(data[i].filter.replace(/'/g, '"'));
        if (!JSONdata.filterList.some((filter) => (filters.indexOf(filter) > - 1))) {
          JSONdata.filterList = ['Others'];
        }
      } else {
        JSONdata.filterList = ['Public'];
      }
      try {
        const dataq = await store.fetchMark(JSONdata.id);
        JSONdata.annotations=dataq;
        const dataqt = await store.fetchHeatMap(JSONdata.id);
        JSONdata.heatmap=dataqt;

        if (slideId == JSONdata.id) {
          getVisualizationData = {...JSONdata};
          console.log('aaa');
          // getVisualizationData.push(JSONdata);
        }
      } catch (error) {
        console.error('Error finding slides:', error);
      }
      // console.log('a b', getVisualizationData);
    }
  } catch (error) {
    console.error('Error finding slides:', error);
  };
}
// Initialize the process
//  initialize();
