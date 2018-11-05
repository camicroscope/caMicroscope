FROM node:8-alpine
RUN mkdir -p /var/www/html/
COPY ./ /var/www/html/
WORKDIR /var/www/html/
RUN npm install -g http-server
RUN npm install -g parcel-bundler
EXPOSE 80
CMD parcel build package/packages.js; http-server -p 80
