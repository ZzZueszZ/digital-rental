FROM nginx:alpine

RUN apk add --no-cache tzdata
ENV TZ="UTC"

COPY ./dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY set_url.sh /set_url.sh
RUN chmod +x /set_url.sh
EXPOSE 80

ARG ENV_BACKEND_HOST
ENV ENV_BACKEND_HOST ${ENV_BACKEND_HOST}

CMD /set_url.sh ${ENV_BACKEND_HOST} && nginx -g 'daemon off;'
