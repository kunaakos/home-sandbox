FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-build AS build

WORKDIR /usr/src/home-sandbox/

COPY package.json .
COPY hsb-service-utils/package.json ./hsb-service-utils/
COPY hsb-things/package.json ./hsb-things/

RUN yarn workspace hsb-service-utils install --no-lockfile --non-interactive
RUN yarn workspace hsb-things install --no-lockfile --non-interactive

COPY hsb-service-utils ./hsb-service-utils
COPY hsb-things ./hsb-things

RUN yarn workspace hsb-service-utils build
RUN yarn workspace hsb-things build

RUN yarn clean-node-modules
RUN yarn workspace hsb-service-utils install --no-lockfile --non-interactive --production
RUN yarn workspace hsb-things install --no-lockfile --non-interactive --production

FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-run

WORKDIR /usr/src/home-sandbox/

RUN yarn global add pino-sentry@0.2.4

COPY package.json .
COPY hsb-service-utils/package.json ./hsb-service-utils/
COPY hsb-things/package.json ./hsb-things/

COPY --from=build /usr/src/home-sandbox/node_modules /usr/src/home-sandbox/node_modules
COPY --from=build /usr/src/home-sandbox/node_modules /usr/src/home-sandbox/node_modules
COPY --from=build /usr/src/home-sandbox/hsb-service-utils/node_modules /usr/src/home-sandbox/hsb-service-utils/node_modules

COPY --from=build /usr/src/home-sandbox/hsb-things/build /usr/src/home-sandbox/hsb-things/build
COPY --from=build /usr/src/home-sandbox/hsb-service-utils/build /usr/src/home-sandbox/hsb-service-utils/build

ENV UDEV=1

# omit the first two lines, which are yarn logs, and cause pino-sentry to throw an error 
CMD yarn workspace hsb-things prod -s | tail -n +3 | pino-sentry --dsn=$SENTRY_DSN
