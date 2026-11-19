ARG IMAGE

# Node.js's November 2026 security release (26.13.1); upstream's backend image still runs 26.12.1.
FROM node:26.13.1-bookworm-slim@sha256:5df79989ed685e09f0a98019db4cebfb22fb9df1a53c0161664a011f7ff6b0f1 AS node

# Upstream's backend pins ws ~8.19.0; 8.21.0 fixes a memory-exhaustion DoS in its server.
FROM node AS ws
WORKDIR /ws
RUN npm pack ws@8.21.3 \
  && node -e "const h='sha512-'+require('crypto').createHash('sha512').update(require('fs').readFileSync('ws-8.21.3.tgz')).digest('base64'); if (h !== 'sha512-201TZ/kPWxoPr/OKWjquZR1SWKXcvxdH+e1xrx89b3YbmzLMFCLfnaG1HFIgWzJOEWZ7MvpK++odZufgYR50Rw==') process.exit(1)" \
  && tar xzf ws-8.21.3.tgz

FROM ${IMAGE}
USER root
COPY --from=node /usr/local/bin/node /usr/bin/node
RUN [ "$(node --version)" = v26.13.1 ]
RUN rm -rf /backend/package/node_modules/ws
COPY --from=ws --chown=1000:1000 /ws/package /backend/package/node_modules/ws
RUN [ "$(node -p "require('/backend/package/node_modules/ws/package.json').version")" = 8.21.3 ]
USER 1000
