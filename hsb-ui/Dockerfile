FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-build AS build

WORKDIR /usr/src/home-sandbox/ui
COPY package.json .
RUN yarn install --no-lockfile --non-interactive
COPY . ./
RUN yarn build

FROM balenalib/raspberrypi4-64-node:12.14.1-bullseye-run

WORKDIR /usr/src/home-sandbox/ui
COPY package.json .
RUN yarn install --no-lockfile --non-interactive --production
COPY --from=build /usr/src/home-sandbox/ui/build /usr/src/home-sandbox/ui/build

ENV UDEV=1
CMD ["yarn", "prod"]
