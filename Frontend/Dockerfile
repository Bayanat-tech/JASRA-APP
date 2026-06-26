# syntax=docker/dockerfile:1.7

FROM node:20-bookworm-slim AS build

ARG REACT_APP_VERSION=v2.1.0
ARG REACT_APP_BASE_URL=http://localhost:8080
ARG REACT_APP_API_URL=http://localhost:8081/
ARG GENERATE_SOURCEMAP=false

ENV REACT_APP_VERSION=${REACT_APP_VERSION} \
    REACT_APP_BASE_URL=${REACT_APP_BASE_URL} \
    REACT_APP_API_URL=${REACT_APP_API_URL} \
    GENERATE_SOURCEMAP=${GENERATE_SOURCEMAP} \
    NODE_OPTIONS=--max-old-space-size=8192 \
    CI=false \
    DISABLE_ESLINT_PLUGIN=true

WORKDIR /app

RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    make \
    python3 \
    libexpat1-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn \
    yarn install --frozen-lockfile --prefer-offline

COPY . .
RUN yarn build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
