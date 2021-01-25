# Cloud Upload APIs Guide


## Google Picker API
The picker API is to be used to allow user to select the file from their google drive.

**Instructions:**
 - Create a new project or go to your existing one at https://console.developers.google.com/ . Go to your project admin settings and note down your project number. (This will be your **`appId`**)
 - Enable the picker api on your project.
 - Go to the credentials page of your project, click on "Create Credentials > API Key"
 - Note down your API key  (This will be your **`developerKey`**)<br>
**Note**: Restrict your API key scopes to avoid unauthorised usage since this key will be public in the frontend.
 -  Go to "OAuth Consent Screen" and create your consent screen
- Select user type as External.
- Proceed to add consent screen. Add your test users email.<br>
**Note**: To allow users other than test users you need to verify your app with google first.
 - Go to the credentials page of your project, click on "Create Credentials > OAuth Client ID"
 - Select type as "Web Application". Then add `http://localhost:4010` to the list of authorised domains and redirect urls. Add other URLs if you have caMicroscope hosted on your own domain.
 - Note down your ClientID.
 - Now you have all your information needed for picker. Paste the details at `/apps/loader/chunked_loader.js` at caMicroscope in the shown place.
 <br>![enter image description here](https://i.ibb.co/PhdTCyp/Screenshot-20201220-154455.jpg)

Read more at https://developers.google.com/picker/docs/

## Google Drive API

Google drive API is to be used on Slideloader backend server to allow the download of file selected by user from the picker api earlier.

**Instructions:**
- Enable the Google Drive API on your project.
-  Go to the credentials page of your project, click on "Create Credentials > OAuth Client ID"
- Select type as "Desktop Application"
- Download the JSON file for your OAuth 2.0 Client ID that you just created.
- There's a dummy file present at `/cloud-upload-apis/credentials/google-drive.json` in the **[Distro](https://github.com/camicroscope/Distro)** ; Replace that file with the JSON file you downloaded in the previous step. <br> 
**Note**: Do not rename the `google-drive.json` file

Read more at https://developers.google.com/drive