const store = new Store('../../data/');
// create the message queue
const message = new MessageQueue();
var userId = getUserId();
var userInfo;
// get user info
store.getUsers(userId).then((data)=>{
  if (Array.isArray(data)&&data.length>0) { // user exist
    userInfo = data[0];
    console.log(userInfo);
  }
}).catch(((error)=>{
  console.error('No user info');
  console.error(error);
}));
if (userInfo&&userInfo.registration&&userInfo.isAgreed&&userInfo.userType=='Admin') {
  window.location = '../landing/landing.html';
} else if (userInfo&&userInfo.registration&&userInfo.isAgreed) {
  window.location = '../landing/crowd.html';
}

Alpaca.Form.prototype.enableSubmitButton = function() {
  this.domEl.find('.alpaca-form-button-submit').attrProp('disabled', false);
  if ($.mobile) {
    try {
      this.domEl.find('.alpaca-form-button-submit').button('refresh');
    } catch (e) { }
  }
};
Alpaca.Form.prototype.disableSubmitButton = function() {
  this.domEl.find('.alpaca-form-button-submit').attrProp('disabled', true);
  if ($.mobile) {
    try {
      this.domEl.find('.alpaca-form-button-submit').button('refresh');
    } catch (e) { }
  }
};


const isConsent = document.getElementById('isConsent');
const agreeBtn = document.querySelector('.consent-footer button.agree');
const declineBtn = document.querySelector('.consent-footer button.decline');
const progress = document.getElementById('progress');
const formSteps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-step');

let formStepsNum = 0;
const next = () => {
  if (formStepsNum < 3) formStepsNum++;
  updateFormSteps();
  updateProgressbar();
};

const prev = () => {
  if (formStepsNum > 0) formStepsNum--;
  updateFormSteps();
  updateProgressbar();
};

const updateFormSteps = () => {
  formSteps.forEach((formStep) => {
    formStep.classList.contains('form-step-active') &&
            formStep.classList.remove('form-step-active');
  });

  if (formSteps[formStepsNum]) formSteps[formStepsNum].classList.add('form-step-active');
};

const updateProgressbar = () => {
  progressSteps.forEach((progressStep, idx) => {
    if (idx < formStepsNum + 1) {
      progressStep.classList.add('progress-step-active');
    } else {
      progressStep.classList.remove('progress-step-active');
    }
  });
  const progressActive = document.querySelectorAll('.progress-step-active');
  progress.style.width =
        ((progressActive.length - 1) / (progressSteps.length - 1)) * 90 + '%';
};

//
const consentChange = () =>{
  if (isConsent.checked) {
    agreeBtn.disabled = false;
  } else {
    agreeBtn.disabled = true;
  }
};

const decline = ()=>{
  window.location = '../../login.html';
};

// -- basic information form config --//
$('#basic').alpaca({
  'schema': {
    'title': 'Basic Information',
    'type': 'object',
    'properties': {
      'firstName': {
        'type': 'string',
        'title': 'First Name',
        'required': true,
      },
      'lastName': {
        'type': 'string',
        'title': 'Last Name',
        'required': true,
      },
      'contactEmail': {
        'type': 'string',
        'title': 'Contact Email',
        'format': 'email',
        'required': true,
      },
      'phoneNumber': {
        'type': 'string',
        'title': 'Phone Number',
        'format': 'phone',
      },
    },
  },
  'options': {
    'form': {
      'buttons': {
        'prev': {
          'label': 'Previous',
          'click': prev,
        },
        'submit': {
          'label': 'Next',
          'click': next,
        },
      },
    },
    'fields': {
      'firstName': {
        'placeholder': 'Enter your first name',

      },
      'lastName': {
        'placeholder': 'Enter your last name',

      },
    },
  },
});
// -- professional form config --//
$('#professional').alpaca({
  'schema': {
    'title': 'Professional',
    'type': 'object',
    'properties': {
      'institutionOfEmployment': {
        'type': 'string',
        'title': 'Institution of Employment',
        'required': true,
      },
      'roleAtInstitution': {
        'type': 'string',
        'title': 'Role at your institution',
        'enum': ['Pathologist', 'Resident', 'Medical Director', 'Other'],

        'required': true,
      },
      'other': {
        'type': 'string',
        'required': true,
      },
      'specialties': {
        'type': 'string',
        'title': 'Board certifications and specialties (or equivalent in your country)',
        'required': true,
      },
      'organizationCountry': {
        'type': 'string',
        'title': 'Board certification or residency organization and country',
        'required': true,
      },

    },
    'dependencies': {
      'other': ['roleAtInstitution'],
    },
  },
  'options': {
    'form': {
      'buttons': {
        'prev': {
          'label': 'Previous',
          'click': prev,
        },
        'submit': {
          'label': 'Next',
          'click': next,
        },
      },
    },
    'fields': {

      'roleAtInstitution': {
        'type': 'radio',
        'sort': function(a, b) {
          if (a.text == 'Other') {
            return 1;
          }
          return 0;
        },
      },
      'other': {
        'dependencies': {
          'roleAtInstitution': ['Other'],
        },
      },
    },
  },
});

$('#certifications').alpaca({
  'schema': {
    'title': 'Certifications',
    'type': 'object',
    'properties': {
      'certYear': {
        'type': 'string',
        'title':
          `If you are a board-certified anatomic pathologist or the equivalent for your country,
           enter the number of years since your certification. 
           (If you are not a board certified anatomic pathologist or equivalent, enter -1)`,
        'required': true,
      },
      'yearsOfResidency': {
        'type': 'string',
        'title': `If you are an anatomic pathology resident, 
          how many years of residency have you had? 
          (If you are not a anatomic pathology resident, enter -1)`,
        'required': true,
      },
      'screenName': {
        'type': 'string',
        'title': 'Please provide a screen name for your data collection',
        'required': true,
      },
    },
  },
  'options': {
    'form': {
      'buttons': {
        'prev': {
          'label': 'Previous',
          'click': prev,
        },
        'submit': {
          'label': 'Submit',
          'click': saveRegistration,
        },
      },
    },
  },
});


async function saveRegistration() {
  // registration
  const registrationForm = {};
  const basic = $('#basic').alpaca().getValue();
  const professional = $('#professional').alpaca().getValue();
  const certifications = $('#certifications').alpaca().getValue();
  $.extend(registrationForm, basic);
  $.extend(registrationForm, professional);
  $.extend(registrationForm, certifications);
  if (userInfo) {
    const id = userInfo._id.$oid;
    delete userInfo._id;
    userInfo.updater = userId;
    userInfo.registration = registrationForm;
    userInfo.isAgreed = isConsent.checked;
    try {
      const rs = await store.updateUser(id, userInfo);
      if (rs.ok&&nModified) {
      } else {
        message.addError('Core Initialization Failed');
      }
    } catch (error) {
      console.error(error);
      message.addError('Core Initialization Failed');
    }
  } else {
    const {email, name, userFilter, userType} = getUserInfo();
    userInfo = {email, name, userFilter, userType};
    userInfo.creator = userInfo.email;
    userInfo.registration = registrationForm;
    userInfo.isAgreed = isConsent.checked;
    try {
      const rs = await store.addUser(userInfo);
      if (rs.ok&&nModified) {
      } else {
        message.addError('Core Initialization Failed');
      }
    } catch (error) {
      console.error(error);
      message.addError('Core Initialization Failed');
    }
  }
  if (getUserType() == 'Admin') {
    window.location = '../landing/landing.html';
  } else {
    window.location = '../landing/crowd.html';
  }
}
