// for use without database
// SEED
var slide1 = [{
  id: "cmu1",
  name: "TEST1",
  location: "/data_dzi/CMU-1-Small-Region/CMU-1-Small-Region.dzi",
  mpp: 0.499,
  checksum: "NA"
}]

var slide2 = [{
  id: "duomo",
  name: "TEST2",
  location: "/data_dzi/duomo/duomo.dzi",
  mpp: 5000,
  checksum: "NA"
}];

var mt1 = [{
  id: "Square",
  slide: "cmu1",
  type: "human",
  name: "cmuMark"
}]
var mt2 = [{
  id: "Triangle",
  slide: "duomo",
  type: "human",
  name: "duomoMark"
}]

var data1 = []
for (var i=0; i<1e3; i++){
  data1.push([Math.floor(Math.random()*100), Math.floor(Math.random()*100),Math.floor(Math.random())])
}

var data2 = []
for (var i=0; i<1e3; i++){
  data2.push([Math.floor(Math.random()*100), Math.floor(Math.random()*100),Math.floor(Math.random())])
}

var hm1 = [{
  slide: "cmu1",
  name: "cmuHeat",
  width: 100,
  height: 100,
  key: "count",
  values: data1
}]
var hm2 = [{
  slide: "duzomo",
  name: "duomoHeat",
  width: 100,
  height: 100,
  key: "count",
  values: data2
}]

var mark1 = [{
  properties: {marktype: "Square"},
  type: "Feature",
  geometry:
    {
      type: "Polygon",
      coordinates: [[[0.1, 0.1],[0.3, 0.1],[0.3, 0.3],[0.1, 0.3]]]
    }
}]
var mark2 = [{
  properties: {marktype: "Triangle"},
  type: "Feature",
  geometry:
    {
      type: "Polygon",
      coordinates: [[[0.25,0.5], [0.75, 0.5], [0.5, 0.25]]]
    }
}
]
// compatibility
function fakePromise(returnval){
  return new Promise((res,rej)=>res(returnval))
}
// data

class Store{
  constructor(config){
    this.config = config;
  }
  setId(id){
    this.slideId = id;
  }

  getSlide(){
    if (this.slideId == "duomo"){
      return fakePromise(slide2);
    } else {
      return fakePromise(slide1);
    }
  }

  getMarktypes(){
    if (this.slideId == "duomo"){
      return fakePromise(mt2);
    } else {
      return fakePromise(mt1);
    }
  }

  getHeatmaps(){
    if (this.slideId == "duomo"){
      return fakePromise(hm2);
    } else {
      return fakePromise(hm1);
    }
  }

  getMarks(marktypes){
    if (this.slideId == "duomo"){
      return fakePromise(mark1);
    } else {
      return fakePromise(mark2);
    }
  }
  getMarkById(markId){
    if (markId == "triangle"){
      return fakePromise(mark1);
    } else {
      return fakePromise(mark2);
    }
  }
}
