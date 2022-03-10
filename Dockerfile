# Creating the builder image to install the backend and frontend package managers
FROM node:16-buster-slim

WORKDIR /
COPY mempool/ .
RUN rm .git && sh docker/init.sh
COPY .git/modules/mempool/refs/heads/master .git/refs/heads/master
RUN apt-get update && apt-get install -y build-essential python3 pkg-config rsync \
        wget netcat jq pwgen vim procps nano \
        mariadb-server mariadb-client nginx \
        && wget https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_arm.tar.gz -O - |\
        tar xz && mv yq_linux_arm /usr/bin/yq

WORKDIR /backend
RUN npm install --prod && npm run build && cp mempool-config.sample.json mempool-config.json

WORKDIR /frontend
RUN npm install --prod && npm run build && rsync -av --delete dist/ /var/www/

WORKDIR /
# install the mempool configuration for nginx
RUN cp nginx.conf /etc/nginx/ && cp nginx-mempool.conf /etc/nginx/conf.d/ && cp nginx-mempool.conf /etc/nginx/nginx-mempool.conf
RUN cp /frontend/wait-for /usr/local/bin/wait-for.sh
# RUN cp /frontend/dist/mempool /var/www/mempool

WORKDIR /backend
USER root
RUN cp wait-for-it.sh /usr/local/bin \
        && chmod +x start.sh \
        && chmod +x /backend/wait-for-it.sh \
        && chmod +x /usr/local/bin/wait-for.sh \
        && mkdir -p data mysql/data mysql/db-scripts


RUN mkdir /var/cache/nginx
RUN touch /var/run/nginx.pid

RUN chown -R 1000:1000 /backend && chmod -R 755 /backend && \
        chown -R 1000:1000 /var/cache/nginx && \
        chown -R 1000:1000 /var/log/nginx && \
        chown -R 1000:1000 /etc/nginx/nginx.conf && \
        chown -R 1000:1000 /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
        chown -R 1000:1000 /var/run/nginx.pid

# BUILD S9 CUSTOM
ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh

# remove default mysql so we can manually handle db initalization
RUN rm -rf /var/lib/mysql/

# USER 1000
EXPOSE 8080 8999 80

ENTRYPOINT ["/usr/local/bin/docker_entrypoint.sh"]