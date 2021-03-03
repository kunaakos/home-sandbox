# see hsb-things.Dockerfile for comments

FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-build AS build

WORKDIR /usr/src/home-sandbox/

COPY package.json .
COPY hsb-service-utils/package.json ./hsb-service-utils/
COPY hsb-gatekeeper/package.json ./hsb-gatekeeper/

RUN yarn workspace hsb-service-utils install --no-lockfile --non-interactive
RUN yarn workspace hsb-gatekeeper install --no-lockfile --non-interactive

COPY hsb-service-utils ./hsb-service-utils
COPY hsb-gatekeeper ./hsb-gatekeeper

RUN yarn workspace hsb-service-utils build
RUN yarn workspace hsb-gatekeeper build

RUN yarn clean-node-modules
RUN yarn workspace hsb-service-utils install --no-lockfile --non-interactive --production
RUN yarn workspace hsb-gatekeeper install --no-lockfile --non-interactive --production

FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-run

WORKDIR /usr/src/home-sandbox/

RUN yarn global add pino-sentry@0.6.1

COPY ./ .

COPY --from=build /usr/src/home-sandbox/node_modules /usr/src/home-sandbox/node_modules
COPY --from=build /usr/src/home-sandbox/hsb-service-utils/node_modules /usr/src/home-sandbox/hsb-service-utils/node_modules
# COPY --from=build /usr/src/home-sandbox/hsb-gatekeeper/node_modules /usr/src/home-sandbox/hsb-gatekeeper/node_modules

COPY --from=build /usr/src/home-sandbox/hsb-service-utils/build /usr/src/home-sandbox/hsb-service-utils/build
COPY --from=build /usr/src/home-sandbox/hsb-gatekeeper/build /usr/src/home-sandbox/hsb-gatekeeper/build

CMD yarn workspace hsb-gatekeeper serve -s | tail -n +3 | pino-sentry --dsn=$SENTRY_DSN --serverName="gatekeeper-$BALENA_DEVICE_UUID"
