FROM node:12-buster-slim AS builder

WORKDIR /build
COPY mempool/ .
# because just a submodule in wrapper project
RUN rm .git
RUN sh docker/init.sh
# generate-config.js uses this ref
COPY .git/modules/mempool/refs/heads/master .git/refs/heads/master

RUN apt-get update
RUN apt-get install -y build-essential python3 pkg-config rsync

WORKDIR /build/frontend
RUN npm i
RUN npm run build

WORKDIR /build/backend
RUN npm ci --production
RUN npm i typescript
RUN npm run build

WORKDIR /build
RUN cp docker/backend/mempool-config.json backend/

FROM node:12-buster-slim

WORKDIR /backend

RUN apt-get update
RUN apt-get install wget netcat jq pwgen vim procps -y
RUN apt-get install nginx -y
RUN wget https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_arm.tar.gz -O - |\
  tar xz && mv yq_linux_arm /usr/bin/yq
RUN apt-get install mariadb-server mariadb-client -y

USER root

COPY --from=builder /build/backend .
COPY --from=builder /build/frontend/wait-for /usr/local/bin/wait-for.sh
COPY --from=builder /build/frontend/dist/mempool /var/www/mempool
COPY --from=builder /build/nginx.conf /etc/nginx/
COPY --from=builder /build/nginx-mempool.conf /etc/nginx/conf.d/
RUN cp wait-for-it.sh /usr/local/bin

RUN chmod +x start.sh
RUN chmod +x /backend/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for.sh

# initalize db folders
RUN mkdir -p data mysql/data mysql/db-scripts
COPY --from=builder /build/mariadb-structure.sql .

RUN mkdir /var/cache/nginx
RUN touch /var/run/nginx.pid

# RUN chown -R 1000:1000 /backend && chmod -R 755 /backend && \
#         chown -R 1000:1000 /var/cache/nginx && \
#         chown -R 1000:1000 /var/log/nginx && \
#         chown -R 1000:1000 /etc/nginx/nginx.conf && \
#         chown -R 1000:1000 /etc/nginx/conf.d
# RUN touch /var/run/nginx.pid && \
#         chown -R 1000:1000 /var/run/nginx.pid


# BUILD S9 CUSTOM
ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh

ADD ./mempool/mariadb-structure.sql /docker-entrypoint-initdb.d/

# remove to we can manually handle db initalization
RUN rm -rf /var/lib/mysql/

# USER 1000
EXPOSE 80 8999 3306

ENTRYPOINT ["/usr/local/bin/docker_entrypoint.sh"]