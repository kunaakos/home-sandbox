FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-build AS build

WORKDIR /usr/src/home-sandbox/things

COPY package.json .
RUN yarn install --no-lockfile --non-interactive
COPY . ./
RUN yarn build

RUN rm -rf node_modules
RUN yarn install --no-lockfile --non-interactive --production

FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-run

WORKDIR /usr/src/home-sandbox/things

RUN yarn global add pino-sentry@0.2.4

COPY package.json .
COPY --from=build /usr/src/home-sandbox/things/node_modules /usr/src/home-sandbox/things/node_modules
COPY --from=build /usr/src/home-sandbox/things/build /usr/src/home-sandbox/things/build

ENV UDEV=1
CMD "yarn prod | pino-sentry --dsn=$SENTRY_DSN"
