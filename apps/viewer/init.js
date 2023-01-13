// CAMIC is an instance of camicroscope core
// $CAMIC in there
let $CAMIC = null;
let tracker;
let $minorCAMIC = null;
// for all instances of UI components
const $UI = new Map();

const $D = {
  pages: {
    home: '../vis-table/index.html',
    table: '../vis-table/index.html',
  },
  params: null, // parameter from url - slide Id and status in it (object).
  overlayers: null, // array for each layers
  templates: null, // json schema for prue-form
  segments: [],
};

window.addEventListener('keydown', (e) => {
  if (!$CAMIC || !$CAMIC.viewer) return;
  const key = e.key;
  // escape key to close all operations
  if ('escape' == key.toLocaleLowerCase()) {
    magnifierOff();
    measurementOff();
    annotationOff();
    presetLabelOff();
  }

  // open annotation (ctrl + a)
  if (e.ctrlKey && 'a' == key.toLocaleLowerCase() && $CAMIC.viewer.canvasDrawInstance) {
    const li = $UI.toolbar.getSubTool('annotation');
    eventFire(li, 'click');
    return;
  }
  // open magnifier (ctrl + m)
  if (e.ctrlKey && 'm' == key.toLocaleLowerCase() && $UI.spyglass) {
    const li = $UI.toolbar.getSubTool('magnifier');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk, 'change');
    return;
  }
  // open measurement (ctrl + r)
  if (e.ctrlKey && 'r' == key.toLocaleLowerCase() && $CAMIC.viewer.measureInstance) {
    e.preventDefault();
    const li = $UI.toolbar.getSubTool('measurement');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk, 'change');
    return;
  }
  // open side-by-side (ctrl + s)
  if (e.ctrlKey && 's' == key.toLocaleLowerCase()) {
    e.preventDefault();
    const li = $UI.toolbar.getSubTool('sbsviewer');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk, 'click');
    return;
  }
  // open side-by-side (ctrl + l)
  if (e.ctrlKey && 'l' == key.toLocaleLowerCase()) {
    e.preventDefault();
    const li = $UI.toolbar.getSubTool('preset_label');
    const chk = li.querySelector('input[type=checkbox]');
    chk.checked = !chk.checked;
    eventFire(chk, 'click');
    return;
  }

  // shortcuts for preset labels
  if ($D.labels &&
    $D.labels.configuration &&
    Array.isArray($D.labels.configuration) &&
    $D.labels.configuration.length > 0 &&
    e.ctrlKey) {
    e.key;
    const elt = $UI.labelsViewer.allLabels.find((l) => l.dataset.key && l.dataset.key.toLowerCase() == e.key.toLowerCase());
    if (elt) {
      $UI.toolbar
          .getSubTool('preset_label')
          .querySelector('input[type=checkbox]').checked = true;
      $UI.labelsViewer.selectLabel(elt);
    }
  }
});

// initialize viewer page
function initialize() {
  var checkPackageIsReady = setInterval(function() {
    if (IsPackageLoading) {
      clearInterval(checkPackageIsReady);
      // create a viewer and set up
      initCore();

      // loading the form template data
      FormTempaltesLoader();

      // loading the overlayers data
      layersLoader();
    }
  }, 100);
}

// setting core functionalities
function initCore() {
  // start initial

  // create the message queue
  $UI.message = new MessageQueue({position: 'bottom-left'});

  // zoom info and mmp
  const opt = {
    draw: {
      // extend context menu btn group
      btns: [
        {
          // annotation
          type: 'btn',
          title: 'Annotation',
          class: 'material-icons',
          text: 'description',
          callback: saveAnnotation,
        },
        {
          // analytics
          type: 'btn',
          title: 'Analytics',
          class: 'material-icons',
          text: 'settings_backup_restore',
          callback: saveAnalytics,
        },
      ],
    },
  };
  // set states if exist
  if ($D.params.states) {
    opt.states = $D.params.states;
  }
  // pathdb home directly
  if ($D.params.mode == 'pathdb') {
    $D.pages.home = '../../../';
    $D.pages.table = '../../../';
  }

  try {
    const slideQuery = {};
    slideQuery.id = $D.params.slideId;
    slideQuery.name = $D.params.slide;
    slideQuery.location = $D.params.location;
    opt.addRulerCallback = onAddRuler;
    opt.deleteRulerCallback = onDeleteRuler;
    $CAMIC = new CaMic('main_viewer', slideQuery, opt);
  } catch (error) {
    Loading.close();
    $UI.message.addError('Core Initialization Failed');
    console.error(error);
    return;
  }

  $CAMIC.loadImg(async function(e) {
    // image loaded
    if (e.hasError) {
      // if this is a retry, assume normal behavior (one retry per slide)
      if ($D.params.retry) {
        $UI.message.addError(e.message);
        // can't reach Slide and return to home page
        if (e.isServiceError) redirect($D.pages.table, e.message, 0);
      } else {
        // If this is our first attempt, try one more time.
        let params = new URLSearchParams(window.location.search);
        params.set('retry', '1');
        window.location.search = params.toString();
      }
    } else {
      $D.params.data = e;
      // popup panel
      $CAMIC.viewer.addHandler('canvas-lay-click', function(e) {
        if (!e.data) {
          $UI.annotPopup.close();
          return;
        }
        // for support QUIP 2.0
        const data = Array.isArray(e.data) ? e.data[e.data.selected] : e.data;

        const type = data.provenance.analysis.source;
        let body;
        let attributes;
        let warning = null;
        switch (type) {
          case 'human':
            let area;
            let circumference;
            if (data.geometries) {
              if (
                (data.selected != null || data.selected != undefined) &&
                data.geometries.features[data.selected] &&
                data.geometries.features[data.selected].properties.area
              ) {
                area = `${Math.round(
                    data.geometries.features[data.selected].properties.area,
                )} μm²`;
              }
              if (
                (data.selected != null || data.selected != undefined) &&
                data.geometries.features[data.selected] &&
                data.geometries.features[data.selected].properties.circumference
              ) {
                circumference = `${Math.round(
                    data.geometries.features[data.selected].properties
                        .circumference,
                )} μm`;
              }
            } // othereise, don't try to calculate area and circumference
            // human

            attributes = data.properties.annotations;
            if (area) attributes.area = area;
            if (circumference) attributes.circumference = circumference;
            body = convertHumanAnnotationToPopupBody(attributes);
            if (
              data.geometries &&
              data.geometries.features[data.selected].properties.isIntersect
            ) {
              warning = `<div style='color:red;text-align: center;font-size:12px;'>Inaccurate Area and Circumference</div>`;
            }
            if (
              data.geometries &&
              data.geometries.features[data.selected].properties.nommp
            ) {
              warning = `<div style='color:red;text-align: center;font-size:12px;'>This slide has no mpp</div>`;
            }

            $UI.annotPopup.showFooter();
            break;
          case 'computer':
            // handle data.provenance.analysis.computation = `segmentation`
            attributes = data.properties.scalar_features[0].nv;
            body = {type: 'map', data: attributes};
            $UI.annotPopup.hideFooter();
            break;
          default:
            return;
            // statements_def
            break;
        }

        $UI.annotPopup.data = {
          id: data.provenance.analysis.execution_id,
          oid: data._id.$oid,
          annotation: attributes,
          selected: e.data.selected,
        };
        const getCateName = () => {
          const items = $UI.layersViewer.setting.categoricalData.human.items;
          var dataType = null;
          for (const key in items) {
            if ({}.hasOwnProperty.call(items, key)) {
              dataType = key;
              if (items.hasOwnProperty(key) &&
                Array.isArray(items[key].items) &&
                items[key].items.some((i) => i.item.id == $UI.annotPopup.data.id)) break;
            }
          }
          return dataType;
        };


        $UI.annotPopup.dataType = null;
        $UI.annotPopup.dataType = data.provenance && data.provenance.analysis &&
          data.provenance.analysis.source && data.provenance.analysis.source == 'human' ?
          getCateName($UI.annotPopup.data.id) : null;

        $UI.annotPopup.setTitle(`id:${data.provenance.analysis.execution_id}`);
        $UI.annotPopup.setBody(body);
        if (warning) $UI.annotPopup.body.innerHTML += warning;

        $UI.annotPopup.open(e.position);
      });

      // create the message bar TODO for reading slide Info TODO
      const messageOpt = {
        id: 'cames',
        content: {key: 'Slide', value: $D.params.crumb?`${$D.params.crumb}/${$D.params.data.name}`:$D.params.data.name},
      };
      // if ($D.params.data.metadata_location) {
      //   const metadata = await $CAMIC.store.getSlideMetadata($D.params.data.metadata_location).then();
      //   if (metadata.hasError) {
      //     $UI.message.addError(metadata.error.toString(), 5000);
      //   } else {
      //     messageOpt.metadata = metadata;
      //   }
      // }
      $UI.slideInfos = new CaMessage(messageOpt);

      // spyglass
      $UI.spyglass = new Spyglass({
        targetViewer: $CAMIC.viewer,
        imgsrc: $D.params.data.url,
      });
    }
  });

  $CAMIC.viewer.addHandler('open', function() {
    $CAMIC.viewer.canvasDrawInstance.addHandler('start-drawing', startDrawing);
    $CAMIC.viewer.canvasDrawInstance.addHandler('stop-drawing', stopDrawing);
    // init UI -- some of them need to wait data loader to load data
    // because UI components need data to initialize
    initUIcomponents();
    // action tracker start
    tracker = new Tracker($CAMIC, $D.params.data._id.$oid, getUserId());
    tracker.start();
  });
}

function createCollectionList() {
  if ($D.collections.length < 1) return 'No Specialties In System';
  return $D.collections.filter((c)=>!c.pid&&$D.params.crumb.split('/')[0]!==c.text).map((c)=>`<div style="margin:1rem 0 0 1rem;"><input type="radio" id="${c._id.$oid}" name="caseGenre" value="${c._id.$oid}">
  <label for="${c._id.$oid}">${c.text}</label></div>`).join('');
}

function createSeniorList() {
  if ($D.seniors.length < 1) return 'No Senior Pathologists In System';
  return $D.seniors.map((s)=>`<div style="margin:1rem 0 0 1rem;"><input type="radio" id="${s._id.$oid}" name="caseSenior" value="${s.key}">
  <label for="${s._id.$oid}">${s.key}</label></div>`).join('');
}

function createBody() {
  return `<div class="container-fluid" style="max-height:950px; overflow:auto;">
  <div class="row">
    <div class="col-sm-6">
    <label class="title">Specialties:</label>
    ${createCollectionList()}
    </div>
    <div class="col-sm-6">
    <label class="title">Other Pathologist:</label>
    ${createSeniorList()}
    </div>
  </div>
</div>`;
}
// initialize all UI components
async function initUIcomponents() {
  // get current user
  const user = await $CAMIC.store.getCurrentUser().then((resp)=>{
    if (resp.status!=200) {
      window.location.href = '../error/401.html';
    }
    return resp;
  }).then((resp)=> resp.json());
  if (Array.isArray(user)&&user.length==0) {
    window.location.href = '../error/401.html';
  }
  if (Array.isArray(user)&&user.length > 0) {
    $D.user = user[0];
  }

  /* loading configurations */
  $D.configurations = await $CAMIC.store.getConfigByName();
  /* create UI components */

  $UI.modalbox = new ModalBox({
    id: 'modalbox',
    hasHeader: true,
    headerText: 'HeatMap List',
    hasFooter: false,
  });
  $UI.caseReassignmentModal = new ModalBox({
    id: 'caseReassignmentModal',
    hasHeader: true,
    headerText: 'Case Reassignment',
    hasFooter: true,
  });
  // -- case reassignment modal start -- //

  // get collection list
  $D.collections = await $CAMIC.store.getAllCollection();

  // get senior pathologist list
  $D.seniors = await $CAMIC.store.getSeniorUsers();
  $UI.caseReassignmentModal.setFooterHTML(`<button class='btn btn-default btn-xs' onclick='reassignCaseClickhandler()' disabled>Reassign</button>`);

  $UI.caseReassignmentModal.setBody(createBody());

  $('#caseReassignmentModal .modalbox-body input[type=radio][name=caseGenre]').on('change', radiosChange);
  $('#caseReassignmentModal .modalbox-body input[type=radio][name=caseSenior]').on('change', radiosChange);
  function radiosChange() {
    const caseGenre = $('#caseReassignmentModal .modalbox-body input[type=radio][name=caseGenre]:checked').val();
    const caseSenior = $('#caseReassignmentModal .modalbox-body input[type=radio][name=caseSenior]:checked').val();
    if (caseGenre&&caseSenior) $UI.caseReassignmentModal.elt.querySelector('.modalbox-footer .btn').disabled = false;
  }


  // -- case reassignment modal end -- //

  const subToolsOpt = [];
  // home;
  if (ImgloaderMode == 'iip') {
    subToolsOpt.push({
      name: 'home',
      icon: 'home', // material icons' name
      title: 'Home',
      type: 'btn', // btn/check/dropdown
      value: 'home',
      callback: goHome,
    });
  }
  // DOE customized for evaluation START

  // get evaluation config
  const evaluationConfig = $D.configurations.find((d)=>d.config_name=='evaluation_form');

  // evaluation form
  if (evaluationConfig && evaluationConfig.enable) {
    $D.evaluationData = await $CAMIC.store.findEvaluation({
      'creator': $D.user.key,
      'slide_id': $D.params.slideId,
    });
    $UI.evalSideMenu = new SideMenu({
      id: 'eval_panel',
      width: 265,
      contentPadding: 5,
      position: 'right',
    });
    const evalCloseDiv = $UI.evalSideMenu.elt.querySelector('.close');
    evalCloseDiv.style.cssText = 'height:24px !important; flex:none;';
    $(evalCloseDiv).find('i').css( 'display', 'none' );

    var evalTitle = document.createElement('div');
    evalTitle.classList.add('item_head');
    evalTitle.textContent = 'Evaluation';
    var evalMessge = document.createElement('div');
    evalMessge.id = 'eval_message';
    var evalForm = document.createElement('div');
    evalForm.id = 'eval_form';

    $UI.evalSideMenu.addContent(evalTitle);
    $UI.evalSideMenu.addContent(evalMessge);
    $UI.evalSideMenu.addContent(evalForm);


    async function saveDraft(data) {
      if ($D.isDraftEvalData == false) return;
      if (!$D.isEvalDataExist) {
        const evalData = {
          'slide_id': $D.params.slideId,
          // 'slide_name': $D.params.data.name,
          'evaluation': data,
          'create_date': new Date(),
          'creator': $D.user.key,
          'is_draft': true,
        };
        try {
          const rs = await $CAMIC.store.addEvaluation(evalData);
          if (rs.error) {
            $UI.message.addError(rs.text);
          } else if (rs.insertedCount && rs.result && rs.result.ok ) {
            $UI.message.add(`Evaluation Draft Saved`);
            $D.isEvalDataExist = true;
          } else {
            $UI.message.addWarning(`Something Happened When Saving Evaluation Draft!`);
          }
        } catch (error) {
          $UI.message.addError(error);
        }
      } else {
        const query = {
          'creator': $D.user.key,
          'slide_id': $D.params.slideId,
        };
        const evalData = {
          'evaluation': data,
          'update_date': new Date(),
          'updater': $D.user.key,
        };
        try {
          const rs = await $CAMIC.store.updateEvaluation(query, evalData);
          if (rs.error) {
            $UI.message.addError(rs.text);
          } else if (rs && rs.result && rs.result.ok ) {
            $UI.message.add(`Evaluation Draft Updated`);
            $D.isEvalDataExist = true;
          } else {
            $UI.message.addWarning(`Something Happened When Saving Evaluation Draft!`);
          }
        } catch (error) {
          $UI.message.addError(error);
        }
      }
    }
    // const formOpt = evaluationConfig.configuration;
    const formOpt = {
      data: {
        slide_quality: null,
        tumor_present: null,
        tumor_histology: null,
        informativeness: null,
      },
      options: {
        fields: {
          slide_quality: {
            label: 'Slide Quality',
            hideNone: true,
            required: true,
            optionLabels: [
              'Unsatisfactory',
              'Satisfactory',
              'Not H&E Stained Slide',
            ],
            events: {
              change: function() {
                // get slide quality value
                const val = this.getValue();
                console.log(val);
                // get Tumor Present, Tumor Histology,Informativeness, Absolute Informativeness, comments object
                var tumorPresent = this.getParent().childrenByPropertyId['tumor_present'];
                var tumorHistology = this.getParent().childrenByPropertyId['tumor_histology'];
                var informativeness = this.getParent().childrenByPropertyId['informativeness'];
                var absoluteInformativeness = this.getParent().childrenByPropertyId['absolute_informativeness'];
                var comments = this.getParent().childrenByPropertyId['comments'];
                // disable Tumor Histology,Informativeness, Absolute Informativeness, comments
                if (val == '2') {
                  // disable Tumor Present
                  tumorPresent.disable();
                  tumorPresent.setValue(null);
                  tumorPresent.field.addClass('disabled');
                  tumorPresent.field.addClass('alpaca-disabled');
                  tumorPresent.control.addClass('disabled');
                  tumorPresent.control.find('input').prop('disabled', true);
                  // disable Tumor Histology
                  tumorHistology.disable();
                  tumorHistology.setValue(null);
                  tumorHistology.field.addClass('disabled');
                  tumorHistology.field.addClass('alpaca-disabled');
                  tumorHistology.control.addClass('disabled');
                  tumorHistology.control.find('input').prop('disabled', true);
                  // disable  Informativeness
                  informativeness.disable();
                  informativeness.setValue(null);
                  informativeness.field.addClass('disabled');
                  informativeness.field.addClass('alpaca-disabled');
                  informativeness.control.addClass('disabled');
                  informativeness.control.find('input').prop('disabled', true);

                  // disable Absolute Informativeness
                  absoluteInformativeness.disable();
                  absoluteInformativeness.setValue(null);
                  absoluteInformativeness.field.addClass('disabled');
                  absoluteInformativeness.field.addClass('alpaca-disabled');
                  absoluteInformativeness.control.addClass('disabled');
                  absoluteInformativeness.control.find('input').prop('disabled', true);

                  // disable comments
                  comments.setValue(null);
                  comments.disable();
                } else { // Tumor Histology,Informativeness, Absolute Informativeness, comments
                  // enable Tumor Present
                  tumorPresent.enable();
                  tumorPresent.field.removeClass('disabled');
                  tumorPresent.field.removeClass('alpaca-disabled');
                  tumorPresent.control.removeClass('disabled');
                  tumorPresent.control.find('input').prop('disabled', false);
                  // enable Tumor Histology
                  tumorHistology.enable();
                  tumorHistology.field.removeClass('disabled');
                  tumorHistology.field.removeClass('alpaca-disabled');
                  tumorHistology.control.removeClass('disabled');
                  tumorHistology.control.find('input').prop('disabled', false);

                  // enable  Informativeness
                  informativeness.enable();
                  informativeness.setValue(null);
                  informativeness.field.removeClass('disabled');
                  informativeness.field.removeClass('alpaca-disabled');
                  informativeness.control.removeClass('disabled');
                  informativeness.control.find('input').prop('disabled', false);
                }
                tumorPresent.refreshValidationState(true);
                tumorHistology.refreshValidationState(true);
                informativeness.refreshValidationState(true);
                absoluteInformativeness.refreshValidationState(true);
                comments.refreshValidationState(true);
                saveDraft(this.getParent().getValue());
              },
            },
          },
          tumor_present: {
            label: 'Tumor Present',
            hideNone: true,
            optionLabels: [
              'No',
              'Yes',
            ],
            events: {
              change: function() {
                const val = this.getValue();
                // get Histology,Informativeness, Absolute Informativeness, comments object
                var tumorHistology = this.getParent().childrenByPropertyId['tumor_histology'];
                var informativeness = this.getParent().childrenByPropertyId['informativeness'];
                var absoluteInformativeness = this.getParent().childrenByPropertyId['absolute_informativeness'];
                var comments = this.getParent().childrenByPropertyId['comments'];
                // disable Tumor Histology,Informativeness, Absolute Informativeness, comments
                if (val == '0') {
                  // disable Tumor Histology
                  tumorHistology.disable();
                  tumorHistology.setValue(null);
                  tumorHistology.field.addClass('disabled');
                  tumorHistology.field.addClass('alpaca-disabled');
                  tumorHistology.control.addClass('disabled');
                  tumorHistology.control.find('input').prop('disabled', true);
                  // disable  Informativeness
                  informativeness.disable();
                  informativeness.setValue(null);
                  informativeness.field.addClass('disabled');
                  informativeness.field.addClass('alpaca-disabled');
                  informativeness.control.addClass('disabled');
                  informativeness.control.find('input').prop('disabled', true);

                  // disable Absolute Informativeness
                  absoluteInformativeness.disable();
                  absoluteInformativeness.setValue(null);
                  absoluteInformativeness.field.addClass('disabled');
                  absoluteInformativeness.field.addClass('alpaca-disabled');
                  absoluteInformativeness.control.addClass('disabled');
                  absoluteInformativeness.control.find('input').prop('disabled', true);

                  // disable comments
                  comments.setValue(null);
                  comments.disable();
                } else { // Tumor Histology,Informativeness, Absolute Informativeness, comments
                  // enable Tumor Histology
                  tumorHistology.enable();
                  tumorHistology.field.removeClass('disabled');
                  tumorHistology.field.removeClass('alpaca-disabled');
                  tumorHistology.control.removeClass('disabled');
                  tumorHistology.control.find('input').prop('disabled', false);

                  // enable  Informativeness
                  informativeness.enable();
                  informativeness.setValue(null);
                  informativeness.field.removeClass('disabled');
                  informativeness.field.removeClass('alpaca-disabled');
                  informativeness.control.removeClass('disabled');
                  informativeness.control.find('input').prop('disabled', false);
                }
                tumorHistology.refreshValidationState(true);
                informativeness.refreshValidationState(true);
                absoluteInformativeness.refreshValidationState(true);
                comments.refreshValidationState(true);
                saveDraft(this.getParent().getValue());
              },
            },
            validator: function(callback) {
              var slideQuality = this.getParent().childrenByPropertyId['slide_quality'].getValue();
              if (slideQuality == '2') {
                callback({
                  status: true,
                });
                return;
              }
              const tumorPresent = this.getValue();
              if (tumorPresent == '') {
                callback({
                  status: false,
                  message: 'This field is not optional',
                });
              } else if (tumorPresent === '1') {
                $CAMIC.store.countMark({
                  'creator': $D.user.key,
                  'provenance.image.slide': $D.params.slideId,
                  'provenance.analysis.source': 'human',
                }).then((d)=>{
                  if (d > 0) {
                    callback({
                      status: true,
                    });
                  } else {
                    // disable submitButton
                    $('#eval_form').alpaca().form.disableSubmitButton();
                    callback({
                      status: false,
                      message: 'Please Create an annotation',
                    });
                  }
                });
              } else {
                callback({
                  status: true,
                });
              }
            },
          },
          tumor_histology: {
            label: 'Tumor Histology',
            hideNone: true,
            optionLabels: [
              'Incorrect',
              'Correct',
            ],
            events: {
              change: function() {
                const val = this.getValue();
                var comments = this.getParent().childrenByPropertyId['comments'];
                if (val == 0) {
                  // comments.control.prop('disabled', false);
                  comments.enable();
                } else {
                  comments.setValue(null);
                  comments.disable();
                  // comments.control.prop('disabled', true);
                }
                comments.refreshValidationState(true);
                saveDraft(this.getParent().getValue());
              },
            },
            validator: function(callback) {
              var slideQuality = this.getParent().childrenByPropertyId['slide_quality'].getValue();
              if (slideQuality == '2') {
                callback({
                  status: true,
                });
                return;
              }

              var tumorPresent = this.getParent().childrenByPropertyId['tumor_present'].getValue();
              if (tumorPresent === '1'&&!this.getValue()) {
                callback({
                  status: false,
                  message: 'This field is not optional',
                });
              } else {
                callback({
                  status: true,
                });
              }
            },
          },
          informativeness: {
            label: 'Informativeness',
            hideNone: true,
            optionLabels: [
              'Uninformative',
              'Informative',
            ],
            events: {
              change: function() {
                const val = this.getValue();
                var absoluteInformativeness = this.getParent().childrenByPropertyId['absolute_informativeness'];
                if (val == 1) {
                  absoluteInformativeness.enable();
                  absoluteInformativeness.field.removeClass('disabled');
                  absoluteInformativeness.field.removeClass('alpaca-disabled');
                  absoluteInformativeness.control.removeClass('disabled');
                  absoluteInformativeness.control.find('input').prop('disabled', false);
                } else {
                  absoluteInformativeness.disable();
                  absoluteInformativeness.setValue(null);
                  absoluteInformativeness.field.addClass('disabled');
                  absoluteInformativeness.field.addClass('alpaca-disabled');
                  absoluteInformativeness.control.addClass('disabled');
                  absoluteInformativeness.control.find('input').prop('disabled', true);
                }
                absoluteInformativeness.refreshValidationState(true);
                saveDraft(this.getParent().getValue());
              },

            },
            validator: function(callback) {
              var slideQuality = this.getParent().childrenByPropertyId['slide_quality'].getValue();
              if (slideQuality == '2') {
                callback({
                  status: true,
                });
                return;
              }

              var tumorPresent = this.getParent().childrenByPropertyId['tumor_present'].getValue();
              if (tumorPresent === '1'&&!this.getValue()) {
                callback({
                  status: false,
                  message: 'This field is not optional',
                });
              } else {
                callback({
                  status: true,
                });
              }
            },
          },
          absolute_informativeness: {
            type: 'radio',
            hideNone: true,
            // disabled: true,
            label: 'Absolute Informativeness',
            optionLabels: [
              '1. Minimally Informative',
              '2. Mildly Informative',
              '3. Moderately Informative',
              '4. Very Informative',
              '5. Maximally Informative',
            ],
            events: {
              change: function() {
                saveDraft(this.getParent().getValue());
              },
            },
            validator: function(callback) {
              var slideQuality = this.getParent().childrenByPropertyId['slide_quality'].getValue();
              if (slideQuality == '2') {
                callback({
                  status: true,
                });
                return;
              }

              var informativeness = this.getParent().childrenByPropertyId['informativeness'].getValue();
              if (informativeness === '1' && !this.getValue()) {
                callback({
                  status: false,
                  message: 'This field is not optional',
                });
              } else {
                callback({
                  status: true,
                });
              }
            },
          },
          comments: {
            disabled: true,
            type: 'textarea',
            label: 'comments',
            helper: 'State correct CAP protocol term',
            helpersPosition: 'above',
            rows: 2,
            events: {
              change: function() {
                saveDraft(this.getParent().getValue());
              },
            },
            validator: function(callback) {
              var slideQuality = this.getParent().childrenByPropertyId['slide_quality'].getValue();
              if (slideQuality == '2') {
                callback({
                  status: true,
                });
                return;
              }

              var tumorHistology = this.getParent().childrenByPropertyId['tumor_histology'].getValue();
              var comments = this.getValue();
              if (tumorHistology === '0' && !comments) {
                callback({
                  status: false,
                  message: 'Please Fill In The Comments',
                });
              } else {
                callback({
                  status: true,
                });
              }
            },
          },
        },
      },
      schema: {
        type: 'object',
        properties: {
          slide_quality: {
            required: true,
            enum: ['0', '1', '2'],
          },
          tumor_present: {
            // required: true,
            enum: ['0', '1'],
          },
          tumor_histology: {
            // required: true,
            enum: ['0', '1'],
          },
          informativeness: {
            // required: true,
            enum: ['0', '1'],
          },
          absolute_informativeness: {
            enum: ['1', '2', '3', '4', '5'],
          },
          comments: {

            type: 'string',
            // required: true,
          },
        },

      },
      postRender: function(control) {
        var slideQuality = control.childrenByPropertyId['slide_quality'];
        var tumorPresent = control.childrenByPropertyId['tumor_present'];
        var tumorHistology = control.childrenByPropertyId['tumor_histology'];
        var informativeness = control.childrenByPropertyId['informativeness'];
        var absoluteInformativeness = control.childrenByPropertyId['absolute_informativeness'];
        var comments = control.childrenByPropertyId['comments'];
        if (!$D.isEvalDataExist) {
          slideQuality.setValue(null);
          tumorPresent.setValue(null);
          // hidden message
          tumorHistology.setValue(null);
          informativeness.setValue(null);
          absoluteInformativeness.setValue(null);
          absoluteInformativeness.disable();
          absoluteInformativeness.field.addClass('disabled');
          absoluteInformativeness.field.addClass('alpaca-disabled');
          absoluteInformativeness.control.addClass('disabled');
          absoluteInformativeness.control.find('input').prop('disabled', true);
          comments.setValue(null);
        } else {
          // if ($D.isDraftEvalData) {
          const eval = $D.evaluationData[0].evaluation;
          if (eval.slide_quality == null || eval.slide_quality == undefined) {
            slideQuality.setValue(null);
          }
          if (eval.tumor_present == null || eval.tumor_present == undefined) {
            tumorPresent.setValue(null);
          }
          if (eval.tumor_histology == null || eval.tumor_histology == undefined) {
            tumorHistology.setValue(null);
          }
          if (eval.informativeness == null || eval.informativeness == undefined) {
            informativeness.setValue(null);
          }
          if (eval.absolute_informativeness == null || eval.absolute_informativeness == undefined) {
            absoluteInformativeness.setValue(null);
          }

          if (eval.slide_quality == 2) {
            // disable Tumor Present
            tumorPresent.disable();
            tumorPresent.setValue(null);
            tumorPresent.field.addClass('disabled');
            tumorPresent.field.addClass('alpaca-disabled');
            tumorPresent.control.addClass('disabled');
            tumorPresent.control.find('input').prop('disabled', true);
          }

          if (eval.tumor_present != 1 ) {
            // disable Tumor Histology
            tumorHistology.disable();
            tumorHistology.setValue(null);
            tumorHistology.field.addClass('disabled');
            tumorHistology.field.addClass('alpaca-disabled');
            tumorHistology.control.addClass('disabled');
            tumorHistology.control.find('input').prop('disabled', true);
            // disable  Informativeness
            informativeness.disable();
            informativeness.setValue(null);
            informativeness.field.addClass('disabled');
            informativeness.field.addClass('alpaca-disabled');
            informativeness.control.addClass('disabled');
            informativeness.control.find('input').prop('disabled', true);
          }

          if (eval.informativeness == 1) {
            absoluteInformativeness.enable();
            absoluteInformativeness.field.removeClass('disabled');
            absoluteInformativeness.field.removeClass('alpaca-disabled');
            absoluteInformativeness.control.removeClass('disabled');
            absoluteInformativeness.control.find('input').prop('disabled', false);
            absoluteInformativeness.refreshValidationState(true);
          } else if (eval.informativeness == null || eval.comments == undefined || eval.informativeness == 0) {
            absoluteInformativeness.disable();
            absoluteInformativeness.setValue(eval.absolute_informativeness);
            absoluteInformativeness.field.addClass('disabled');
            absoluteInformativeness.field.addClass('alpaca-disabled');
            absoluteInformativeness.control.addClass('disabled');
            absoluteInformativeness.control.find('input').prop('disabled', true);
          } else {
            absoluteInformativeness.setValue(null);
          }
          if (eval.comments == null || eval.comments == undefined) {
            comments.setValue(null);
          }
          control.refreshValidationState(true);
          //
        }
        // re-verify form
        control.form.refreshValidationState(true);
        setTimeout(() => {
          control.form.adjustSubmitButtonState();
        }, 1000);
      },

    };

    formOpt.options.form = {
      'buttons': {
        'submit': {'label': 'save', 'click': saveEvaluation},
      },

    };

    // set data if evaluation Data existed
    if ($D.evaluationData && Array.isArray($D.evaluationData) && $D.evaluationData[0] && $D.evaluationData[0].evaluation) {
      $D.isEvalDataExist = true;
      $D.isDraftEvalData = $D.evaluationData[0].is_draft;
      formOpt.data = $D.evaluationData[0].evaluation;
      if ($D.isDraftEvalData) {
        evalMessge.textContent = 'Draft Data: Please Complete the Evaluation and Save';
      } else {
        evalMessge.textContent = null;
      }
    } else {
      $D.isEvalDataExist = false;
      $D.isDraftEvalData = true;
      evalMessge.textContent = 'Draft Data: Please Complete the Evaluation and Save';
    }

    $('#eval_form').alpaca(formOpt);


    subToolsOpt.push({
      name: 'eval',
      icon: 'list_alt', // material icons' name
      title: 'Evaluation',
      type: 'check', // btn/check/dropdown
      value: 'eval',
      callback: toggleEvalPanel,
    });
  }
  // DOE customized for evaluation END

  // meta data
  $UI.metaSideMenu = new SideMenu({
    id: 'meta_panel',
    width: 250,
    contentPadding: 5,
  });

  subToolsOpt.push({
    name: 'meta',
    icon: 'description', // material icons' name
    title: 'Metadata',
    type: 'check', // btn/check/dropdown
    value: 'meta',
    callback: toggleMetaPanel,
  });

  var metaTitle = document.createElement('div');
  metaTitle.classList.add('item_head');
  metaTitle.textContent = 'Slide Metadata';
  var metaDiv = document.createElement('div');
  metaDiv.innerHTML = createMetadataContent();
  metaDiv.id = 'meta_form';
  $UI.metaSideMenu.addContent(metaTitle);
  $UI.metaSideMenu.addContent(metaDiv);

  // create the meta data from
  function createMetadataContent() {
    const metadata = $D.params.data;
    const rows = [];

    // const skips = [undefined, 'slide_id', '_id', 'collections', 'comment',
    // 'height', 'level_count', 'location', 'md5sum',
    // 'mpp', 'mpp-x', 'name', '', 'slide', 'specimen', 'study', 'timestamp',
    // 'url', 'width', 'registry_code', 'create_date'];
    const titleMap = {
      token_id: 'Token ID',
      vendor: 'Scanner Make',
      objective: 'Scanning Magnification',
      proc_seq: 'Procedure Sequence',
      spec_site: 'Specimen Site',
      image_id: 'Image ID',
      primary_tumor_site_code: 'Primary Tumor Site Code',
      primary_tumor_site_term: 'Primary Tumor Site Term',
      morphology_code: 'ICD-O Morphology Code',
      seer_coded_histology: 'SEER Coded Histology',
      behavior_code: 'Behavior Code',
    };
    // ['md5sum', '_id', 'collections', 'common', 'location', 'slide', 'url'];

    for (const [key, value] of Object.entries(titleMap)) {
      rows.push(`<div class='row'><div class='title'>${value}</div><div class='text'>${$D.params.data[key]?$D.params.data[key]:''}</div></div>`);
    }
    return `<div class='message-body'>${rows.join('')}</div>`;
  };

  // pen
  subToolsOpt.push({
    name: 'annotation',
    icon: 'create', // material icons' name
    title: 'Draw',
    type: 'multistates',
    callback: draw,
  });

  subToolsOpt.push({
    name: 'preset_label',
    icon: 'colorize', // material icons' name
    title: 'Preset Labels',
    type: 'check',
    value: 'prelabels',
    callback: drawLabel,
  });

  // magnifier
  subToolsOpt.push({
    name: 'magnifier',
    icon: 'search',
    title: 'Magnifier',
    type: 'dropdown',
    value: 'magn',
    dropdownList: [
      {
        value: 0.5,
        title: '0.5',
        checked: true,
      },
      {
        value: 1,
        title: '1.0',
      },
      {
        value: 2,
        title: '2.0',
      },
    ],
    callback: toggleMagnifier,
  });
  // measurement tool
  if ($CAMIC.viewer.measureInstance) {
    subToolsOpt.push({
      name: 'measurement',
      icon: 'straighten',
      title: 'Measurement',
      type: 'dropdown',
      value: 'measure',
      dropdownList: [
        {
          value: 'straight',
          title: 'straight',
          icon: 'straighten',
          checked: true,
        },
        {
          value: 'coordinate',
          title: 'coordinate',
          icon: 'square_foot',
        },
      ],
      callback: toggleMeasurement,
    });
  }
  // enhance
  subToolsOpt.push({
    name: 'Enhance',
    icon: 'invert_colors',
    title: 'Enhance',
    type: 'dropdown',
    value: 'Enhance',
    dropdownList: [
      {
        value: 'Histogram Eq',
        title: 'Histogram Equalization',
        icon: 'leaderboard',
        checked: true,
      },
      {
        value: 'Edge',
        title: 'Edge',
        icon: 'show_chart',
      },
      {
        value: 'Sharpen',
        title: 'Sharpen',
        icon: 'change_history',
      },
      {
        value: 'Custom',
        title: 'Custom',
        icon: 'api',
      },
    ],
    callback: enhance,
  });
  // share
  if (ImgloaderMode == 'iip') {
    subToolsOpt.push({
      name: 'share',
      icon: 'share',
      title: 'Share View',
      type: 'btn',
      value: 'share',
      callback: shareURL,
    });
  }
  // side-by-side
  subToolsOpt.push({
    name: 'sbsviewer',
    icon: 'view_carousel',
    title: 'Side By Side Viewer',
    value: 'dbviewers',
    type: 'check',
    callback: toggleViewerMode,
  });
  // heatmap
  subToolsOpt.push({
    name: 'heatmap',
    icon: 'satellite',
    title: 'Heat Map',
    value: 'heatmap',
    type: 'btn',
    callback: openHeatmap,
  });
  subToolsOpt.push({
    name: 'labeling',
    icon: 'label',
    title: 'Labeling',
    value: 'labeling',
    type: 'btn',
    callback: function() {
      window.location.href = `../labeling/labeling.html${window.location.search}`;
    },
  });
  subToolsOpt.push({
    name: 'segment',
    icon: 'timeline',
    type: 'btn',
    value: 'rect',
    title: 'Segment',
    callback: function() {
      if (window.location.search.length > 0) {
        window.location.href =
          '../segment/segment.html' + window.location.search;
      } else {
        window.location.href = '../segment/segment.html';
      }
    },
  });
  subToolsOpt.push({
    name: 'model',
    icon: 'aspect_ratio',
    type: 'btn',
    value: 'rect',
    title: 'Predict',
    callback: function() {
      if (window.location.search.length > 0) {
        window.location.href = '../model/model.html' + window.location.search;
      } else {
        window.location.href = '../model/model.html';
      }
    },
  });

  // -- For Nano borb Start -- //
  if (ImgloaderMode == 'imgbox') {
    // download
    subToolsOpt.push({
      name: 'downloadmarks',
      icon: 'cloud_download',
      title: 'Download Marks',
      type: 'btn',
      value: 'download',
      callback: Store.prototype.DownloadMarksToFile,
    });
    subToolsOpt.push({
      name: 'uploadmarks',
      icon: 'cloud_upload',
      title: 'Load Marks',
      type: 'btn',
      value: 'upload',
      callback: Store.prototype.LoadMarksFromFile,
    });
  }
  // -- For Nano borb End -- //

  // -- view btn START -- //
  // if (!($D.params.data.hasOwnProperty('review') && $D.params.data['review'] == 'true')) {
  //   subToolsOpt.push({
  //     name: 'review',
  //     icon: 'playlist_add_check',
  //     title: 'has reviewed',
  //     type: 'btn',
  //     value: 'review',
  //     callback: updateSlideView,
  //   });
  // }
  subToolsOpt.push({
    name: 'reassign',
    icon: 'sync_alt',
    title: 'Case Reassignment',
    type: 'btn',
    value: 'reassign',
    callback: ()=>{
      $UI.caseReassignmentModal.open();
    },
  });

  // screenshot
  subToolsOpt.push({
    name: 'slideCapture',
    icon: 'camera_enhance',
    title: 'Slide Capture',
    type: 'btn',
    value: 'slCap',
    callback: captureSlide,
  });
  subToolsOpt.push({
    name: 'tutorial',
    icon: 'help',
    title: 'Tutorial',
    value: 'tutorial',
    type: 'btn',
    callback: function() {
      tour.init();
      tour.start(true);
    },
  });

  // Additional Links handler
  function additionalLinksHandler(url, openInNewTab) {
    if (appendSlide === true) {
      url = url + '?slide=' + $D.params.slideId;
      url = url + '&state=' + StatesHelper.encodeStates(StatesHelper.getCurrentStates());
    }
    if (openInNewTab === true) {
      window.open(url, '_blank').focus();
    } else {
      window.location.href = url;
    }
  }

  var additionalLinksConfig = $D.configurations.find((d)=>d.config_name=='additional_links');
  if (additionalLinksConfig && additionalLinksConfig.configuration && Array.isArray(additionalLinksConfig.configuration)) {
    additionalLinksConfig.configuration.forEach((link) => {
      var openInNewTab = link.openInNewTab === false ? false : true;
      var appendSlide = link.appendSlide === true ? true : false;
      var url = link.url;
      subToolsOpt.push({
        name: link.displayName,
        icon: link.icon ? link.icon : 'link',
        title: link.displayName,
        value: link.displayName,
        type: 'btn',
        callback: function() {
          additionalLinksHandler(url, openInNewTab, appendSlide);
        },
      });
    });
  }

  // create the tool bar
  $UI.toolbar = new CaToolbar({
    /* opts that need to think of*/
    id: 'ca_tools',
    zIndex: 601,
    mainToolsCallback: mainMenuChange,
    subTools: subToolsOpt,
  });

  // evaluation panel and meta data panel open
  // if (!$D.isEvalDataExist|| $D.isDraftEvalData) {
  const evalLi = $UI.toolbar.getSubTool('eval');
  evalLi.querySelector('input[type=checkbox]').checked = true;
  $UI.evalSideMenu.open();

  const metaLi = $UI.toolbar.getSubTool('meta');
  metaLi.querySelector('input[type=checkbox]').checked = true;
  $UI.metaSideMenu.open();
  // }

  // create two side menus for tools
  $UI.appsSideMenu = new SideMenu({
    id: 'side_apps',
    width: 300,
    // , isOpen:true
    callback: toggleSideMenu,
  });

  $UI.layersSideMenu = new SideMenu({
    id: 'side_layers',
    width: 250,
    contentPadding: 5,
    // , isOpen:true
    callback: toggleSideMenu,
  });

  const loading = `<div class="cover" style="z-index: 500;"><div class="block"><span>loading layers...</span><div class="bar"></div></div></div>`;
  $UI.layersSideMenu.addContent(loading);

  /* annotation popup */
  $UI.annotPopup = new PopupPanel({
    footer: [
      // { // edit
      //   title:'Edit',
      //   class:'material-icons',
      //   text:'notes',
      //   callback:annoEdit
      // },
      {
        // delete
        title: 'Delete',
        class: 'material-icons',
        text: 'delete_forever',
        callback: annoDelete,
      },
    ],
  });

  // TODO -- labels //
  $UI.labelsSideMenu = new SideMenu({
    id: 'labels_layers',
    width: 180,
    contentPadding: 5,
  });
  var labelsTitle = document.createElement('div');
  labelsTitle.classList.add('item_head');
  labelsTitle.textContent = 'Label Manager';

  $UI.labelsSideMenu.addContent(labelsTitle);

  $D.labels = $D.configurations.find((d)=>d.config_name=='preset_label');
  $UI.labelsViewer = new LabelsViewer({
    id: 'labelmanager',
    data: $D.labels ? $D.labels.configuration : [],
    onAdd: addPresetLabelsHandler,
    onEdit: editPresetLabelsHandler,
    onRemove: removePresetLabelsHandler,
    onSelected: selectedPresetLabelsHandler,
  },
  );
  $UI.labelsViewer.elt.parentNode.removeChild($UI.labelsViewer.elt);
  $UI.labelsSideMenu.addContent($UI.labelsViewer.elt);

  // == end -- //

  var checkOverlaysDataReady = setInterval(function() {
    if (
      $D.params.data &&
      $CAMIC &&
      $CAMIC.viewer &&
      $CAMIC.viewer.omanager
    ) {
      clearInterval(checkOverlaysDataReady);
      // for segmentation
      $CAMIC.viewer.createSegment({
        store: $CAMIC.store,
        slide: $D.params.data.slide,
        data: [],
      });

      // create control

      // TODO move to add layers
      // create main layer viewer items with states
      // const mainViewerData = $D.overlayers.map((d) => {
      //   const isShow =
      //     $D.params.states &&
      //     $D.params.states.l &&
      //     $D.params.states.l.includes(d.id) ?
      //       true :
      //       false;
      //   return {item: d, isShow: isShow};
      // });


      // TODO move to add layers
      // create monir layer viewer items
      // const minorViewerData = $D.overlayers.map((d) => {
      //   return {item: d, isShow: false};
      // });

      // create UI and set data
      $UI.layersViewer = createLayerViewer(
          'overlayers',
          [],
          callback.bind('main'),
          rootCallback.bind('main'),
      );
      // create UI and set data - minor
      $UI.layersViewerMinor = createLayerViewer(
          'overlayersMinor',
          [],
          callback.bind('minor'),
          rootCallback.bind('minor'),
      );

      // TODO move to add layers
      // if ($D.params.states && $D.params.states.l) {
      //   $D.params.states.l.forEach((id) =>
      //     loadAnnotationById($CAMIC, $UI.layersViewer.getDataItemById(id), null),
      //   );
      // }

      $UI.layersList = new CollapsibleList({
        id: 'layerslist',
        list: [
          {
            id: 'left',
            title: 'Left Viewer',
            content: 'No Template Loaded', // $UI.annotOptPanel.elt
            // isExpand:true
          },
          {
            id: 'right',
            title: 'Right Viewer',
            content: 'No Template Loaded', // $UI.algOptPanel.elt,
          },
        ],
        changeCallBack: function(e) {
          // console.log(e);
        },
      });
      $UI.layersSideMenu.clearContent();
      // add to layers side menu
      const title = document.createElement('div');
      title.classList.add('item_head');
      title.textContent = 'Layers Manager';

      $UI.layersSideMenu.addContent(title);

      // loading status
      $UI.loadStatus = document.createElement('div');
      $UI.loadStatus.style.display = 'none';
      $UI.loadStatus.classList.add('load-status');
      $UI.loadStatus.innerHTML = `<div class="material-icons loading">cached</div><div class="text">Loading</div>`;
      $UI.layersSideMenu.addContent($UI.loadStatus);

      // zoom locker control
      $UI.lockerPanel = document.createElement('div');
      $UI.lockerPanel.classList.add('lock_panel');
      $UI.lockerPanel.style.display = 'none';
      $UI.lockerPanel.innerHTML = `<label>Zoom Lock<input type="checkbox" checked></label>`;
      $UI.lockerPanel
          .querySelector('input[type=checkbox]')
          .addEventListener('change', (e) => {
            isLock = !isLock;
            if (isLock) {
              $minorCAMIC.viewer.viewport.zoomTo(
                  $CAMIC.viewer.viewport.getZoom(true),
                  $CAMIC.viewer.viewport.getCenter(true),
                  true,
              );
              $CAMIC.viewer.controls.bottomright.style.display = 'none';
            } else {
              $CAMIC.viewer.controls.bottomright.style.display = '';
            }
          });

      $UI.layersSideMenu.addContent($UI.lockerPanel);

      $UI.layersList.clearContent('left');
      $UI.layersList.addContent('left', $UI.layersViewer.elt);
      $UI.layersList.clearContent('right');
      $UI.layersList.addContent('right', $UI.layersViewerMinor.elt);

      $UI.layersList.elt.parentNode.removeChild($UI.layersList.elt);
      closeMinorControlPanel();
      $UI.layersSideMenu.addContent($UI.layersList.elt);
    }
  }, 300);

  var checkTemplateSchemasDataReady = setInterval(function() {
    if ($D.templates) {
      clearInterval(checkTemplateSchemasDataReady);
      const annotRegex = new RegExp('annotation', 'gi');
      const annotSchemas = $D.templates.filter((item) =>
        item.id.match(annotRegex),
      );
      /* annotation control */
      $UI.annotOptPanel = new OperationPanel({
        // id:
        // element:
        formSchemas: annotSchemas,
        resetCallback: resetCallback,
        action: {
          title: 'Save',
          callback: annoCallback,
        },
      });

      const title = document.createElement('div');
      title.classList.add('item_head');
      title.textContent = 'Annotation';
      $UI.appsSideMenu.addContent(title);
      $UI.annotOptPanel.elt.classList.add('item_body');
      $UI.appsSideMenu.addContent($UI.annotOptPanel.elt);
    }
  }, 300);
}
function createLayerViewer(id, viewerData, callback, rootCallback) {
  const layersViewer = new LayersViewer({
    id: id,
    data: viewerData,
    removeCallback: removeCallback,
    locationCallback: locationCallback,
    callback: callback,
    rootCallback: rootCallback,

  });
  layersViewer.elt.parentNode.removeChild(layersViewer.elt);
  return layersViewer;
}

// create lay panel for side-by-side control
function createLayPanelControl() {
  $UI.layCtrlbar = document.createElement('div');
  $UI.layCtrlbar.style = `
  display:none;
  margin: .2rem;
  background-color: #365f9c;
  cursor: default;
  padding: .5rem;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 1.2rem;`;

  createRadios();
  $UI.layersSideMenu.addContent($UI.layCtrlbar);
  // control
  const radios = $UI.layCtrlbar.querySelectorAll('input[name=ctrlPane]');
  radios.forEach((r) => {
    r.addEventListener('change', function(e) {
      const val = e.target.value;
      switch (val) {
        case 'main':
          $UI.layersViewer.elt.style.display = 'flex';
          $UI.layersViewerMinor.elt.style.display = 'none';
          break;
        case 'minor':
          $UI.layersViewer.elt.style.display = 'none';
          $UI.layersViewerMinor.elt.style.display = 'flex';
          break;
        default:
          // statements_def
          break;
      }
    });
  });
}

function createRadios() {
  const temp = `
  <input id="_3ojv6szi7" name="ctrlPane" type="radio" value="main" checked>
  <label for="_3ojv6szi7">Main(left)</label>
  <input id="_3ojv6szi8" name="ctrlPane" type="radio" value="minor">
  <label for="_3ojv6szi8">Minor(right)</label>
  `;
  $UI.layCtrlbar.innerHTML = temp;
}

function redirect(url, text = '', sec = 5) {
  let timer = sec;
  if (!timer) {
    window.location.href = url;
  }
  setInterval(function() {
    if (!timer) {
      window.location.href = url;
    }
    if (Loading.instance && Loading.instance.parentNode) {
      Loading.text.textContent = `${text} ${timer}s.`;
    } else {
      Loading.open(document.body, `${text} ${timer}s.`);
    }
    // Hint Message for clients that page is going to redirect to Flex table in 5s
    timer--;
  }, 1000);
}

function updateSlideView() {
  if (!confirm(`Do you want to mark this slide as reviewed?`)) return;
  Loading.open(document.body, 'changing review status ...');
  $CAMIC.store.updateSlideReview($D.params.slideId, 'true').then(function(e) {
    if (e.status == 200) {
      $UI.toolbar.getSubTool('review').style.display = 'none';
    }
  }).finally(function() {
    Loading.close();
  });
}


function addHumanLayerItems() {
  const mainViewerItems = {
    'other': {
      item: {
        id: 'other',
        name: 'other',
      },
      items: [],
    },
  };

  $D.humanlayers.reduce((items, d) => {
    const isShow =
      $D.params.states &&
        $D.params.states.l &&
        $D.params.states.l.includes(d.id) ?
        true :
        false;
    if (d.label&&d.label.id&&d.label.name) { // preset  label
      const {id, name} = d.label;
      if (!items[id]) {
        items[id] = {
          item: {
            id: id,
            name: name,
          },
          items: [],
        };
      }
      items[id].items.push({item: d, isShow});
    } else { // other
      items['other'].items.push({item: d, isShow});
    }
    return items;
  }, mainViewerItems);

  $UI.layersViewer.addHumanItems(mainViewerItems);

  // minor viewer minorViewer
  const minorViewerItems = {
    'other': {
      item: {
        id: 'other',
        name: 'other',
      },
      items: [],
    },
  };

  $D.humanlayers.reduce((items, d)=> {
    const isShow =
      $D.params.states &&
        $D.params.states.l &&
        $D.params.states.l.includes(d.id) ?
        true :
        false;
    if (d.label&&d.label.id&&d.label.name) {

    }
    if (d.label&&d.label.id&&d.label.name) { // preset  label
      const {id, name} = d.label;
      if (!items[id]) {
        items[id] = {
          item: {
            id: id,
            name: name,
          },
          items: [],
        };
      }
      items[id].items.push({item: d, isShow});
    } else { // other
      items['other'].items.push({item: d, isShow});
    }
    return items;
  }, minorViewerItems);

  $UI.layersViewerMinor.addHumanItems(minorViewerItems);
}
function openLoadStatus(text) {
  const txt = $UI.loadStatus.querySelector('.text');
  txt.textContent = `Loading ${text}`;
  $UI.loadStatus.style.display = null;
}
function closeLoadStatus() {
  $UI.loadStatus.style.display = 'none';
}
function addRulerLayerItems(data) {
  const mainViewerData = $D.rulerlayers.map((d) => {
    return {item: d, isShow: false};
  });
  // create monir layer viewer items
  const minorViewerData = $D.rulerlayers.map((d) => {
    return {item: d, isShow: false};
  });
  $UI.layersViewer.addItems(mainViewerData, 'ruler');
  $UI.layersViewerMinor.addItems(minorViewerData, 'ruler');
}

function addComputerLayerItems(data) {
  const mainViewerData = $D.computerlayers.map((d) => {
    return {item: d, isShow: false};
  });
  // create monir layer viewer items
  const minorViewerData = $D.computerlayers.map((d) => {
    return {item: d, isShow: false};
  });
  $UI.layersViewer.addItems(mainViewerData, 'segmentation');
  $UI.layersViewerMinor.addItems(minorViewerData, 'segmentation');
}

function addHeatmapLayerItems(data) {
  const mainViewerData = $D.heatmaplayers.map((d) => {
    return {item: d, isShow: false};
  });
  // create monir layer viewer items
  const minorViewerData = $D.heatmaplayers.map((d) => {
    return {item: d, isShow: false};
  });
  $UI.layersViewer.addItems(mainViewerData, 'heatmap');
  $UI.layersViewerMinor.addItems(minorViewerData, 'heatmap');
}

// const mainViewerData = $D.overlayers.map((d) => {
//   const isShow =
//     $D.params.states &&
//     $D.params.states.l &&
//     $D.params.states.l.includes(d.id) ?
//       true :
//       false;
//   return {item: d, isShow: isShow};
// });


// TODO move to add layers
// create monir layer viewer items
// const minorViewerData = $D.overlayers.map((d) => {
//   return {item: d, isShow: false};
// });
