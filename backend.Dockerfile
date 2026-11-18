ARG IMAGE

# Node.js's November 2026 security release (26.13.1); upstream's backend image still runs 26.12.1.
FROM node:26.13.1-bookworm-slim@sha256:5df79989ed685e09f0a98019db4cebfb22fb9df1a53c0161664a011f7ff6b0f1 AS node

FROM ${IMAGE}
USER root
COPY --from=node /usr/local/bin/node /usr/bin/node
RUN [ "$(node --version)" = v26.13.1 ]
USER 1000
