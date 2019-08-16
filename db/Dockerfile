FROM postgres:alpine
ENV POSTGRES_USER postgres
ENV POSTGRES_PASSWORD secret
ENV POSTGRES_DB database
ADD setup.sql /docker-entrypoint-initdb.d/
RUN chmod a+r /docker-entrypoint-initdb.d/*
EXPOSE 5432