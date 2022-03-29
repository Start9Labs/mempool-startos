FROM node:16-buster-slim AS builder

WORKDIR /build
COPY mempool/ .
# because just a submodule in wrapper project
RUN rm .git && sh docker/init.sh
# generate-config.js uses this ref
COPY .git/modules/mempool/refs/heads/master .git/refs/heads/master

RUN apt-get update && apt-get install -y build-essential python3 pkg-config rsync

WORKDIR /build/frontend
RUN npm i && npm run build

WORKDIR /build/backend
RUN npm ci --production && npm i typescript && npm run build

WORKDIR /build
RUN cp docker/backend/mempool-config.json backend/

FROM node:16-buster-slim

WORKDIR /backend

RUN apt-get update && apt-get install wget netcat jq pwgen vim procps nginx curl mariadb-server mariadb-client -y \
        && wget https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_arm.tar.gz -O - |\
        tar xz && mv yq_linux_arm /usr/bin/yq

USER root

COPY --from=builder /build/backend .
COPY --from=builder /build/frontend/wait-for /usr/local/bin/wait-for.sh
COPY --from=builder /build/frontend/dist/mempool /var/www/mempool
COPY --from=builder /build/nginx.conf /etc/nginx/
COPY --from=builder /build/nginx-mempool.conf /etc/nginx/conf.d/
COPY --from=builder /build/nginx-mempool.conf /etc/nginx/nginx-mempool.conf
RUN cp wait-for-it.sh /usr/local/bin && chmod +x start.sh && chmod +x /backend/wait-for-it.sh && chmod +x /usr/local/bin/wait-for.sh \
        # initalize db folders
        && mkdir -p data mysql/data mysql/db-scripts \
        && mkdir /var/cache/nginx \
        && touch /var/run/nginx.pid \
        && chown -R 1000:1000 /backend && chmod -R 755 /backend && \
        chown -R 1000:1000 /var/cache/nginx && \
        chown -R 1000:1000 /var/log/nginx && \
        chown -R 1000:1000 /etc/nginx/nginx.conf && \
        chown -R 1000:1000 /etc/nginx/conf.d \
        && touch /var/run/nginx.pid && \
        chown -R 1000:1000 /var/run/nginx.pid

# BUILD S9 CUSTOM
ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
ADD assets/utils/health-check.sh /usr/local/bin/health-check.sh
ADD assets/utils/health-check.sh /usr/local/bin/check-synced.sh
RUN chmod +x /usr/local/bin/health-check.sh
RUN chmod +x /usr/local/bin/check-synced.sh

# remove to we can manually handle db initalization
RUN rm -rf /var/lib/mysql/

# USER 1000
EXPOSE 8080 8999 80

ENTRYPOINT ["/usr/local/bin/docker_entrypoint.sh"]
# CMD ["nginx", "-g", "daemon off;"]