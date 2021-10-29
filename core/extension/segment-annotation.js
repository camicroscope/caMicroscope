// segmentation display supports toggling, deletion, loading, saving
class segmentationanno{
  constructor(camic, d, ui, slide, deleteCallback){
    this.data = []; //internal storage
    this.slide = slide;
    this.camic = camic;
    this.ui = ui;
    this.deleteCallback = deleteCallback;
    // popup panels
    this.annotPopup = new PopupPanel({
      footer: [{
          title: 'Delete',
          class: 'material-icons',
          text: 'delete_forever',
          callback: this.deleteSegment,},],
    });
    camic.viewer.addHandler('canvas-lay-click', e => {
      if (!e.data) {
        this.annotPopup.close();
        return;}
      let data = Array.isArray(e.data) ? e.data[e.data.selected] : e.data;
      let attributes = data.properties.annotations;
      attributes.area = `${Math.round(data.geometries.features[data.selected].properties.area,)} μm²`
      attributes.circumference = `${Math.round(data.geometries.features[data.selected].properties.circumference,)} μm`;
      let body = convertHumanAnnotationToPopupBody(attributes);
      this.annotPopup.data = {
        id: data.provenance.analysis.execution_id,
        oid: data._id.$oid,
        annotation: attributes,
        selected: data.selected,
      };
      this.annotPopup.dataType = null;
      this.annotPopup.setTitle(`id:${data.provenance.analysis.execution_id}`);
      this.annotPopup.setBody(body);
      this.annotPopup.showFooter();
      this.annotPopup.open(e.position);
    });
  }
  saveSegment = (image,data,notes) => {
    if(!data.features.length) //empty
      return;
    if(!data.features[0].geometry.coordinates.length)
      return;
    data = ImageFeaturesToVieweportFeatures( // scale
           this.camic.viewer, data);
    // Add new lines to notes to prevent overflow
    let str = notes.notes || '';
    var resultString = '';
    while (typeof str==='string' && str.length > 0) {
      resultString += str.substring(0, 36) + '\n';
      str = str.substring(36);}
    notes.notes = resultString;
    notes.name = "segment_"+notes.name;
    const execId = notes.name+randomId();

    const annotJson = {
      creator: getUserId(),
      created_date: new Date(),
      provenance: {
        image: {
          slide: this.slide,
        },
        analysis: {
          source: 'human',
          execution_id: execId,
          name: notes.name,
        },
      },
      properties: {
        annotations: notes
      },
      geometries:data,
      // image:image
    };
    this.camic.store
        .addMark(annotJson)
        .then((data) => {
          console.log(data)
          this.loadsegmentation({id:execId}, true);
        })
        .catch((e) => {
          this.ui.message.addError(e);
          console.log('save failed', e);
        })
        .finally(() => {});
  }
  loadsegmentation = (p, isShow) => {
    let u = this.data.findIndex(e => (e.id==p.id));
    if(u==-1) this.loadSegById(p.id);
    else{
      if(isShow == undefined) isShow = !this.data[u].layer.isShow;
      if (!isShow && this.annotPopup.data && this.annotPopup.data.id===this.data[u].id) this.annotPopup.close();
      this.data[u].layer.isShow = isShow;
      this.camic.viewer.omanager.updateView();
    }
  }
  loadSegById(id) {
    this.camic.store
        .getMarkByIds([id], this.slide, null)
        .then((data) => {
          // response error
          if(data.error || !data[0]){
            if(this.deleteCallback)
              this.deleteCallback(id);
            return;}
          data[0].geometries = VieweportFeaturesToImageFeatures( // scale
                               this.camic.viewer, data[0].geometries);
          let item = {data:data[0]};
          let temp = {id:id,item:item};
          item.id = id;
          item.render = this.annoRender;
          item.viewer = this.camic.viewer;
          // if(item.data.image) // display whole segmentation image
          //  item.data.image.data = new ImageData(new Uint8ClampedArray(item.data.image.data),item.data.image.width,item.data.image.height);
          // preprocess
          item.data.geometries.features.forEach((e)=>
          {e.properties.style = {
                  color: '#FFFF00',
                  lineCap: 'round',
                  lineJoin: 'round',
                  isFill: true};});
          // overlays
          temp.layer = this.camic.viewer.omanager.addOverlay(item);
          this.camic.viewer.omanager.updateView();
          this.data.push(temp);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
        });
  }
  deleteSegment = (p) => {
    if (!confirm(`Are You Sure You Want To Delete This Segmentation {ID:${p.id}}?`)) return;
    this.data.splice(this.data.findIndex(e => e.id === p.id),1);
    this.camic.viewer.omanager.removeOverlay(p.id);
    this.annotPopup.close();
    if(this.deleteCallback)
      this.deleteCallback(p.id);
    this.camic.store
        .deleteMarkByExecId(p.id, this.slide)
        .then((datas) => {
          console.log(datas);
        })
        .catch((e) => {
          this.ui.message.addError(e);
        })
        .finally(() => {
        });
  }
  annoRender(ctx, data) {
    DrawHelper.draw(ctx, data.geometries.features);
  }
};
function convertHumanAnnotationToPopupBody(notes) {
  const rs = {type: 'map', data: []};
  for (let field in notes) {
    if (notes.hasOwnProperty(field)) {
      const val = notes[field];
      field = field
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      rs.data.push({key: field, value: val});
    }
  }
  return rs;
}
