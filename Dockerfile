FROM postgres:alpine
COPY mockdata/ /docker-entrypoint-initdb.d/