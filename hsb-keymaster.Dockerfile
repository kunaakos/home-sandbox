# see hsb-things.Dockerfile for comments

FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-build AS build

WORKDIR /usr/src/home-sandbox/

COPY package.json .
COPY hsb-service-utils/package.json ./hsb-service-utils/
COPY hsb-keymaster/package.json ./hsb-keymaster/

RUN yarn workspace hsb-service-utils install --no-lockfile --non-interactive
RUN yarn workspace hsb-keymaster install --no-lockfile --non-interactive

COPY hsb-service-utils ./hsb-service-utils
COPY hsb-keymaster ./hsb-keymaster

RUN yarn workspace hsb-service-utils build
RUN yarn workspace hsb-keymaster build

RUN yarn clean-node-modules
RUN yarn workspace hsb-service-utils install --no-lockfile --non-interactive --production
RUN yarn workspace hsb-keymaster install --no-lockfile --non-interactive --production

FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-run

WORKDIR /usr/src/home-sandbox/

RUN yarn global add pino-sentry@0.2.4

COPY ./ .

COPY --from=build /usr/src/home-sandbox/node_modules /usr/src/home-sandbox/node_modules
COPY --from=build /usr/src/home-sandbox/hsb-service-utils/node_modules /usr/src/home-sandbox/hsb-service-utils/node_modules
# COPY --from=build /usr/src/home-sandbox/hsb-keymaster/node_modules /usr/src/home-sandbox/hsb-keymaster/node_modules

COPY --from=build /usr/src/home-sandbox/hsb-service-utils/build /usr/src/home-sandbox/hsb-service-utils/build
COPY --from=build /usr/src/home-sandbox/hsb-keymaster/build /usr/src/home-sandbox/hsb-keymaster/build

CMD yarn workspace hsb-keymaster prod -s | tail -n +3 | pino-sentry --dsn=$SENTRY_DSN --serverName="gatekeeper-$BALENA_DEVICE_UUID"
