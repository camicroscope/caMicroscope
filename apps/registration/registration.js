const store = new Store('../../data/');
// create the message queue
const message = new MessageQueue({position:"custom"});
const modal = document.getElementById('emailModal');

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

// modal  footer btn event
$('#emailModal').find('.modal-footer .btn').on('click', ()=>{
  if (getUserType() == 'Admin') {
    window.location = '../landing/landing.html';
  } else {
    window.location = '../landing/crowd.html';
  }
});

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
const decline = ()=>{
  window.location = '../../login.html';
};

function addKcUser(user){
  return fetch('../../kcAddUser', {
    method: 'POST',
    body: JSON.stringify(user)
  }).then(x=>x.json())
};

function addPublicUser(user){
  return fetch('../../addPublicUser',{
    method: 'post',
    body: JSON.stringify(user)
  }).then(x=>x.json())
}

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
      'specialties': {
        'type': 'string',
        'title': 'Board certifications and specialties or equivalent for your country (or enter NA)',
        'required': true,
      },
      'organizationCountry': {
        'type': 'string',
        'title': 'Board certification or residency organization and country (or enter NA)',
        'required': true,
      },
      'experience': {
        'type': 'integer',
        'minimum': -1,
        'maximum': 100,
        'title':
          'If you are a board-certified anatomic pathologist or the equivalent for your country, enter the number of years since your certification. (If you are not a board certified anatomic pathologist or equivalent, enter -1)',
        'required': true,
      },
      'experienceResident': {
        'minimum': -1,
        'maximum': 100,
        'type': 'integer',
        'title': 'If you are an anatomic pathology resident, how many years of residency have you had? (If you are not a anatomic pathology resident, enter -1)',
        'required': true,
      },
    },
  },
  'options': {
    'fields': {
      'experienceResident': {
        'default': -1,
      },
      'experience': {
        'default': -1,
      },
      'organizationCountry': {
        'default': "NA",
      },
      'specialties': {
        'default': "NA",
      },
    },
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

async function requestResetPassword(email){
  user_req = {"email": email}
  return await fetch("../../requestResetPassword", {
    method: 'POST',
    body: JSON.stringify(user_req)
  }).then(x=>x.json()).then(x=>{
    console.info(x)
  }).catch(e=>{
    console.error(e);
  });
}


async function saveRegistration() {
  // registration
  let registrationForm = {}
  let basic = $('#basic').alpaca().getValue();
  let professional = $('#professional').alpaca().getValue();
  let certifications = $('#certifications').alpaca().getValue();
  Object.assign(registrationForm, basic, professional, certifications);
  let userRegInfo = {}

  userRegInfo.email = registrationForm.contactEmail;
  userRegInfo.userType = "[]"
  userRegInfo.creator = userRegInfo.contactEmail;
  userRegInfo.registration = registrationForm;
  userRegInfo.isAgreed = isConsent.checked;
  let now_time = new Date;
  userRegInfo.create_date = now_time.toISOString();
  try {
    const rs = await addPublicUser(userRegInfo);
    if (rs.insertedCount&&rs.insertedIds) {
      // create keycloak user
      let kcUserInfo = {
        "firstName": registrationForm.firstName,
        "lastName": registrationForm.lastName,
        "email": registrationForm.contactEmail,
        "username": registrationForm.contactEmail,
        "enabled": "true",
      }
      let kcRes = await addKcUser(kcUserInfo);
      if (kcRes.username){
        console.log("successful user add")
        await requestResetPassword(registrationForm.contactEmail)
        window.location = "./registration_success.html";
      } else {
        message.addError('Failed to add user to keycloak', 10000);
        console.log(kcRes);
        window.location = "./registration_error.html?msg=Keycloak with " + encodeURIComponent(JSON.stringify(kcRes));

      }
    } else {
      message.addError('Failed to add this new user', 10000);
      window.location = "./registration_error.html?msg= DB with " + encodeURIComponent(JSON.stringify(rs));
    }
  } catch (error) {
    console.error(error);
    message.addError('Error in user creation.', 10000);
    window.location = "./registration_error.html?msg= Other Err with " + encodeURIComponent(JSON.stringify(error));
  }

  console.log(userInfo);

  // window.location.href = "../landing/landing.html";
}

function openEmailModal(message, isSucceed=true) {
  if (isSucceed) {
    //
    $('#emailModal').find('.modal-header').removeClass('bg-danger');
    $('#emailModal').find('.modal-header').addClass('bg-primary');
    $('#emailModal').find('.modal-title').html(`<label style='margin:0;'>Registration Successful</label>`);
    $('#emailModal').find('.modal-footer .btn').removeClass('btn-danger');
    $('#emailModal').find('.modal-footer .btn').addClass('btn-primary');
    $('#emailModal').find('.modal-footer .btn').text('Contiune');
  } else {
    //
    $('#emailModal').find('.modal-header').removeClass('bg-primary');
    $('#emailModal').find('.modal-header').addClass('bg-danger');
    $('#emailModal').find('.modal-title').html(`<label class='text-danger' style='margin:0;'>Registration Failed!</label>`);
    $('#emailModal').find('.modal-footer .btn').addClass('btn-danger');
    $('#emailModal').find('.modal-footer .btn').removeClass('btn-primary');
    $('#emailModal').find('.modal-footer .btn').text('Ok');
  }
  $('#emailModal').find('.modal-body')
      .html(message);
  $('#emailModal').modal('show');
}


window.addEventListener('load',function(){
  document.getElementById('isConsent').addEventListener( "change", (e)=> { document.querySelector('.consent-footer button.agree').disabled = !e.target.checked});
  });
  
