FROM httpd:alpine
EXPOSE 80
COPY ./ /usr/local/apache2/htdocs/
WORKDIR /usr/local/apache2/htdocs/
RUN rm -rf ./.git/
