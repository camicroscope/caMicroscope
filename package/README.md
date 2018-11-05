# Packaged Extensions for caMicroscope
package/packages.js is built to dist/packages.js in the container build step (or with parcel build package/packages.js)

To include extensions in the build, include a packages.js file which imports your extensions, and does any necessary initalization/running.
packages.js is included at the end of viewer.html
