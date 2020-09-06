# stage 1 uses a thicc image that has everything that node-gyp needs
FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-build AS build

RUN install_packages \
	gcc-9-base \
	libgcc-9-dev \
	libc6-dev \
	libudev-dev
#   alsa-utils \
#   bluealsa \
#   bluez \
WORKDIR /usr/src/home-sandbox/

# copy only the package.json files that are needed, other services changing shouldn't affect this layer
COPY package.json .
COPY hsb-service-utils/package.json ./hsb-service-utils/
COPY hsb-things/package.json ./hsb-things/

# install dev dependencies, not using lockfiles for now, because
# they will be different on x86 and arm, soting this issue out is a TODO
RUN yarn workspace hsb-service-utils install --no-lockfile --non-interactive
RUN yarn workspace hsb-things install --no-lockfile --non-interactive

# copy source
COPY hsb-service-utils ./hsb-service-utils
COPY hsb-things ./hsb-things

# run builds
RUN yarn workspace hsb-service-utils build
RUN yarn workspace hsb-things build

# delete all node_modules direcories and reinstall deps, this time for production only
RUN yarn clean-node-modules
RUN yarn workspace hsb-service-utils install --no-lockfile --non-interactive --production
RUN yarn workspace hsb-things install --no-lockfile --non-interactive --production

# stage 2 is a lightweight image, deps won't build using this one,
# so we're reusing node_modules from the previous stage
FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-run

RUN install_packages \
	bluetooth \
	bluez \
	libbluetooth-dev \
	libudev-dev

WORKDIR /usr/src/home-sandbox/

# pino transport is installed here, so it's not a dependency in any of the projects,
# nor is it needed when developing locally 
RUN yarn global add pino-sentry@0.2.4

# copy all sources so they're available to sentry
COPY ./ .

# copy node_modules directories
# NOTE: these aren't generated for all services, because yarn hoists dependencies
# a missing node_modules directory can cause a build error!
COPY --from=build /usr/src/home-sandbox/node_modules /usr/src/home-sandbox/node_modules
COPY --from=build /usr/src/home-sandbox/hsb-service-utils/node_modules /usr/src/home-sandbox/hsb-service-utils/node_modules
# COPY --from=build /usr/src/home-sandbox/hsb-things/node_modules /usr/src/home-sandbox/hsb-things/node_modules

# copy bundles (and sourcemaps)
COPY --from=build /usr/src/home-sandbox/hsb-service-utils/build /usr/src/home-sandbox/hsb-service-utils/build
COPY --from=build /usr/src/home-sandbox/hsb-things/build /usr/src/home-sandbox/hsb-things/build

# TODO: https://www.balena.io/docs/reference/base-images/base-images/#working-with-dynamically-plugged-devices
ENV UDEV=1

# `hciconfig hci0 reset` might not be needed, was used during debugging
# omit the first two lines, which are yarn logs, and cause pino-sentry to throw an error 
CMD hciconfig hci0 reset && yarn workspace hsb-things prod -s | tail -n +3 | pino-sentry --dsn=$SENTRY_DSN --serverName="things-$BALENA_DEVICE_UUID"
