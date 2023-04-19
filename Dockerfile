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
    apt-get install -y nginx wait-for-it wget curl pwgen \
    build-essential python3 pkg-config rsync gettext \
    && wget https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_${PLATFORM}.tar.gz -O - |\
      tar xz && mv yq_linux_${PLATFORM} /usr/bin/yq \
    && apt-get clean
RUN groupadd -r mysql && useradd -r -g mysql mysql

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
COPY --from=db /usr/bin/mysql_install_db /usr/bin/mysql_install_db
COPY --from=db /usr/share/mysql /usr/share/mysql
COPY --from=db /usr/bin/my_print_defaults /usr/bin/my_print_defaults

# Copy MySQL server binary and libraries
COPY --from=db /usr/sbin/mysqld /usr/sbin/mysqld
COPY --from=db /usr/lib/mysql /usr/lib/mysql



# Create data folder for cache and MySQL data
RUN mkdir -p /build/data/cache /build/mysql/data

# Set user and group for the folders
RUN chown -R 1000:1000 /build/data /build/mysql/data

# BUILD S9 CUSTOM
ADD ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
ADD assets/utils/*.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/*.sh

# remove to we can manually handle db initalization
RUN rm -rf /var/lib/mysql/
