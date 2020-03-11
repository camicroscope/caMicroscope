FROM node:8-alpine
RUN mkdir -p /var/www/html/
RUN npm config set unsafe-perm true
RUN npm install -g http-server
RUN npm install -g parcel-bundler
EXPOSE 80
COPY ./ /var/www/html/
WORKDIR /var/www/html/
RUN rm -rf ./.git/
CMD parcel build package/packages.js; http-server -p 80
