FROM httpd:alpine
EXPOSE 80
ARG cacheoff
RUN if [ ! -z ${cacheoff} ]; then mv .nocache.htaccess .htaccess; fi
COPY ./ /usr/local/apache2/htdocs/
WORKDIR /usr/local/apache2/htdocs/
RUN rm -rf ./.git/
