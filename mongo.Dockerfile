FROM mongo:4.2.3-bionic

# bind mounts are not allowed by balena, so this image is only needed to expand the mongo image with the db init scripts
COPY ./__scripts/mongo/docker-entrypoint-initdb.d /docker-entrypoint-initdb.d

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["mongod"]
