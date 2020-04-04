FROM httpd:alpine
EXPOSE 80
ARG cacheoff
COPY ./ /usr/local/apache2/htdocs/
WORKDIR /usr/local/apache2/htdocs/
RUN if [ ! -z ${cacheoff} ]; then mv .nocache.htaccess .htaccess; fi
RUN rm -rf ./.git/
