FROM postgres:alpine
COPY db_schema.sql /docker-entrypoint-initdb.d/