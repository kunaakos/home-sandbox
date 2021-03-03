# see hsb-things.Dockerfile for comments

FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-build AS build

WORKDIR /usr/src/home-sandbox/

COPY package.json .
COPY hsb-service-utils/package.json ./hsb-service-utils/
COPY hsb-ui/package.json ./hsb-ui/

RUN yarn workspace hsb-service-utils install --no-lockfile --non-interactive
RUN yarn workspace hsb-ui install --no-lockfile --non-interactive

COPY hsb-service-utils ./hsb-service-utils
COPY hsb-ui ./hsb-ui

RUN yarn workspace hsb-service-utils build
RUN yarn workspace hsb-ui build

RUN yarn clean-node-modules
RUN yarn workspace hsb-service-utils install --no-lockfile --non-interactive --production
RUN yarn workspace hsb-ui install --no-lockfile --non-interactive --production

FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-run

WORKDIR /usr/src/home-sandbox/

RUN yarn global add pino-sentry@0.2.4

COPY ./ .

COPY --from=build /usr/src/home-sandbox/node_modules /usr/src/home-sandbox/node_modules
COPY --from=build /usr/src/home-sandbox/hsb-service-utils/node_modules /usr/src/home-sandbox/hsb-service-utils/node_modules
# COPY --from=build /usr/src/home-sandbox/hsb-ui/node_modules /usr/src/home-sandbox/hsb-ui/node_modules

COPY --from=build /usr/src/home-sandbox/hsb-service-utils/build /usr/src/home-sandbox/hsb-service-utils/build
COPY --from=build /usr/src/home-sandbox/hsb-ui/build /usr/src/home-sandbox/hsb-ui/build

CMD yarn workspace hsb-ui serve -s | tail -n +3 | pino-sentry --dsn=$SENTRY_DSN --serverName="ui-$BALENA_DEVICE_UUID"
