# Use a multi-stage build to combine the specific images
FROM mempool/frontend:latest AS frontend
FROM mempool/backend:latest AS backend
FROM mariadb:10.5.8 AS db
FROM node:16.16.0-buster-slim AS builder

USER root
# arm64 or amd64
ARG PLATFORM
# aarch64 or x86_64
ARG ARCH
# Install necessary packages
RUN apt-get update && \
    apt-get install -y nginx wait-for-it wget curl \
    build-essential python3 pkg-config rsync \
    && wget https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_${PLATFORM}.tar.gz -O - |\
      tar xz && mv yq_linux_${PLATFORM} /usr/bin/yq \
    && apt-get clean

WORKDIR /patch

# Copy frontend files
COPY --from=frontend /patch/entrypoint.sh .
COPY --from=frontend /patch/wait-for .
COPY --from=frontend /var/www/mempool /var/www/mempool
COPY --from=frontend /etc/nginx/nginx.conf /etc/nginx/
COPY --from=frontend /etc/nginx/conf.d/nginx-mempool.conf /etc/nginx/conf.d/

WORKDIR /backend

# Copy backend files
COPY --from=backend /backend/package ./package/
COPY --from=backend /backend/GeoIP ./GeoIP/
COPY --from=backend /backend/mempool-config.json /backend/start.sh /backend/wait-for-it.sh ./

# Copy database files
COPY --from=db /var/lib/mysql /build/db

# BUILD S9 CUSTOM
ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
ADD assets/utils/*.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/*.sh

# remove to we can manually handle db initalization
RUN rm -rf /var/lib/mysql/
