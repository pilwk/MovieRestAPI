FROM postgres:alpine as pg_db
COPY mockdata/ /docker-entrypoint-initdb.d/

FROM node:current-alpine as builder
WORKDIR /app
COPY src/package*.json ./
RUN npm install
COPY src/. .

FROM node:current-alpine as node_server
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY ./src .
CMD ["node","server.js"]