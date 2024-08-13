function test() {
  console.log('result', getVisualizationData);
};

function initialize() {
  const store = new Store('../data/');
  store.findSlide()
      .then(function(data) {
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
          store.fetchMark(JSONdata.id).then(function(dataq) {
            JSONdata.annotations=dataq;
            store.fetchHeatMap(JSONdata.id).then(function(dataqt) {
              JSONdata.heatmap=dataqt;
              // console.log("JSONdata", JSONdata.id);
              if (slideId == JSONdata.id) {
                getVisualizationData.push(JSONdata);
                console.log('aaa');
              }
              // addbody(JSONdata);
            });
          });
          //  console.log('a b',getVisualizationData);
        }
      });
}
