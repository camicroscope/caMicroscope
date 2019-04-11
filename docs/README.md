# caMicroscope
caMicroscope is a HTML5 image viewer optimized for large bio-medical image data viewing, with a strong emphasis on cancer pathology.
This guide has sections for different kinds of use of the platform. [User Guide](#user-guide) covers the basics on how to use caMicroscope viewer. [nanoBorb](#nanoborb) covers nanoBorb, the version of caMicroscope designed as a standalone application for individual users without a server. [Hosted Setup](#hosted-setup) covers how to set up caMicroscope for multiple users on a server. [Developer Guide](#developer-guide) covers the broad strokes on how to add new functionality to caMicroscope.

# User Guide
UNDER CONSTRUCTION

# nanoBorb
To use caMicroscope as a standalone application, see [nanoBorb](https://github.com/SBU-BMI/nanoBorb/releases).
The [user guide screencast](https://drive.google.com/open?id=1HkkL5FqEIgi7fzqKijtUhWBPlplh_uHF) should explain the basics of nanoBorb.

1. Download zip file.
2. Unzip.
3. 
    * For Windows, Run "nanoborb.exe" in the unzipped folder
    * For MacOS, Move nanoBorb app to Applications folder and Double-click copied nanoBorb file to run.

# Hosted Setup
The full distribution repository for hosted caMicroscope is [here](https://github.com/camicroscope/Distro/).
run with `docker-compose -f caMicroscope.yml up`

this will build all services and run in the foreground.
Use `docker-compose -f caMicroscope.yml build` to rebuild the services.

Once everything is up, go to \<the host this is running on\>:4010/ to see the landing page.

## SSL
To enable ssl, mount the private key and certificate files to the security service in /root/src/ssl/privatekey.pem and /root/src/ssl/certificate.pem respectively. HTTPS mode will only be enabled if both of these files are present.

## Component Services
mongo - vanilla mongo container

idxMongo - ephemeral container to index mongo (that is, this container is *expected* to exit once it's done its job)

bindaas - api service for mongo (see https://github.com/sharmalab/bindaas)

iip - slide tile server (see https://github.com/camicroscope/iipImage)

viewer - hosts the viewer files and builds packages ( see https://github.com/camicroscope/caMicroscope)

loader - extracts metadata needed for image loading (see https://github.com/camicroscope/SlideLoader)

elevate - security proxy (see https://github.com/camicroscope/Security)

auth - consumes external JWT and issues caMicroscope JWT (see Security Section)

## Configuration
Logging - Container Logging is, for HIPAA reasons, disabled. Feel free to use a different logging engine if desired, especially for development.

Routes - This is handled by the security service/ca-security container. By default routes go the viewer, unless a specific pattern in routes.json is matched.

Image Volume -  The default images directory. If this is changed, please make the same change across all impacted services.

Packages - Packages are built in the viewer service using parcel. Mount a different directory with packages.js to the package directory to overwrite or add functionality.

## Security
For standard security, we use a combination of an external identity provider and an internal authorization service. The authorization service consumes Json Web Tokens (JWTs) from the identity provider, and then will issue JWTs which convey both authentication and authorization, which are consumed by the application.

### Getting an Identity Provider and Setting up Login

There are many identity providers, but for testing and examples, we have been using auth0.

When selecting, an identity provider, note that we expect it to provide a JWT, and to have a certificate/public key/secret which can be used to verify such JWTs.

The example given in the Distro within config/login.html is set up for auth0. Change the corresponding variables for your auth0 application if auth0 is used. If using another identity provider, then login.html, or equivalent, needs to, at least, set the JWT to a cookie called &quot;token&quot;, and call the auth service&#39;s &#39;check&#39; route, and save a successful result as the token. Follow the guide which your identity provider uses for further guidance.

### Keys/Certificates

Add the following files; by default, they are mounted:

- --./jwt\_keys/certificate or ./jwt\_keys/jwk.json is the certificate/public key/secret or jwk (respectively) from the **identity provider**. (If both are included, the jwk takes precedence).
- --./jwt\_keys/key and ./jwt\_keys/key.pub are used as the signing and check keys for the **auth service**
  - --These can (and should) be generated with ./kwt\_keys/make\_keys.sh

### Deployment Configuration

To make caMicroscope private, remove the enviornment variable `DISABLE_SEC=true` under the security service to block routes to unauthenticated users.

### Adding Users to Database

Add users as in ./config/add\_mongo\_users.js. Attributes can be added to deny access to routes (e.g. allow only some users to post and delete)

The name field is the email field (or failing that, sub field) in that priority from the identity provider.


## PathDB

To use pathdb, use pathDbCamic.yml instead of caMicroscope.yml. This deployment does not include the auth and loader as separate services, as this PathDB provides that functionality.


# Developer Guide
We are collecting feedback to write this section in more detail. Please give any feedback to [this form](https://docs.google.com/forms/d/e/1FAIpQLScL91LxrpAZjU88GBZP9gmcdgdf8__uNUwhws2lzU6Lr4qNwA/viewform).

caMicroscope is designed to be extended. Depending on the manner of extension, it may be a package or a new application. It is highly recommended to use a minimal methods of extension to avoid code duplication and issues with future upgrade compatibility.

The viewer container builds package/package.js on build, and the resulting file is included in the viewer. This is used to add small custom functionality tweaks to the viewer.

For more substantial modifications, it may make more sense to make a new application. These can be mounted somewhere (preferably somewhere in the apps folder) in the viewer service, and would include modification of the toolbar, or implementation of an entirely new functionality

caMicroscope is open source software. Any involvement and contribution with the caMicroscope project is greatly appreciated. Feel free to get directly involved in any of the repositories in the caMicroscope organization.

It is highly recommended to make any changes off of the develop branch of a repository, and, when ready, create a PR to the develop branch of the source repository.

The creation of additional specializations, packages, or applications should, in most cases, live as a separate repository.
