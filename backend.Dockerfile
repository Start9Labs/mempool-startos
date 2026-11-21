ARG IMAGE

# Node.js's November 2026 security release (26.13.1); upstream's backend image still runs 26.12.1.
FROM node:26.13.1-bookworm-slim@sha256:5df79989ed685e09f0a98019db4cebfb22fb9df1a53c0161664a011f7ff6b0f1 AS node

# Upstream's backend pins ws ~8.19.0; 8.23.0 fixes memory-exhaustion DoSes in its server.
FROM node AS ws
WORKDIR /ws
RUN npm pack ws@8.23.0 \
  && node -e "const h='sha512-'+require('crypto').createHash('sha512').update(require('fs').readFileSync('ws-8.23.0.tgz')).digest('base64'); if (h !== 'sha512-wCkmX8QMOrKjgO8HW2WyDbTSGeqkocxgDzS9iR79rEAexty6/2qzilx3Ag8Tqf9ykop3irLKle0MtVn5qjVnoQ==') process.exit(1)" \
  && tar xzf ws-8.23.0.tgz

FROM ${IMAGE}
USER root
COPY --from=node /usr/local/bin/node /usr/bin/node
RUN [ "$(node --version)" = v26.13.1 ]
RUN rm -rf /backend/package/node_modules/ws
COPY --from=ws --chown=1000:1000 /ws/package /backend/package/node_modules/ws
RUN [ "$(node -p "require('/backend/package/node_modules/ws/package.json').version")" = 8.23.0 ]
USER 1000
