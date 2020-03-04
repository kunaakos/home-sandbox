# HOME 🏘 AUTOMATION 🤖 SANDBOX 💥

It's an experiment. If you're planning to use this, don't (at least not yet). If you're planning to develop this, use Visual Studio Code, because debugging and testing will be set up to run conveniently from there. It's not set up at all curently.

## services

### gatekeeper

It's the app gateway that deals with authentication and proxying, and eventually more gateway-y things like ssl termination, rate limiting and such.

It will be split into two separate services in the future, handling memberships and issuing user tokens will be moved to another service. To illustrate:

![yup.](https://i.imgur.com/ZfQSTjz.png)

### things

Interfaces with hardware and third party APIs, serves a websocket API that the client can use to retreive up-to-date thing state.

### ui

Client side app and static file server that serves said app.

## sevelopment

### dependencies

For development you need [yarn](https://yarnpkg.com/), [docker](https://www.docker.com/products/docker-desktop) and hopefully nothing else.

If you feel like deploying, you need the [Balena CLI](https://www.balena.io/docs/reference/balena-cli/) and a [Raspberry Pi 4](https://www.raspberrypi.org/). It will probably work on other Rasbperry boards, but you really don't want to run docker and microservices on a Pi Zero, for example.

### deploying to production

This is built for the [Balena](https://www.balena.io/what-is-balena) platform, which means that deploying this - once you have the balena cli on your machine - is as easy as `balena push <your balena app name>`. There's no CI/CD yet but there will be! But first, like, tests and stuff haha.

### local versus production

Before diving into anything, you need to know that this is deployed to a [Raspberry Pi 4](https://www.raspberrypi.org/), which is [ARMv8](https://en.wikipedia.org/wiki/ARM_architecture) - but during development you'll most likely be running it on an [x86](https://en.wikipedia.org/wiki/X86) machine. One has to tread lightly to make this work!

Now you could theoretically just `docker-compose up` the whole thing the same way it happens in production, and on a properly configured dev machine docker will even run the ARM containers for you thanks to some amazing tech wizardry, but this is **very slow**. And there's not much point in doing it, because the only service that relies on actual Raspberry hardware is things. And the current `docker-compose.yml` is for balena only, so if you tried using compose before reading this and it didn't work, it's because volumes are not configured for running locally in that file, and env vars aren't set either.

So instead of emulating the Raspberry, the small handful of modules that rely on it are mocked, and none of the services are containerized during development. This should be pretty fast.

### environment variables

Services are configured using env vars. This means you need to have a `.env` file in your project root with all the required values. Template coming soon!

The `.env` file is not used in production, [use the Balena UI instead](https://www.balena.io/docs/reference/balena-cli/#environment-variables).

### getting it running

Once you have your env vars ready, you may go ahead and install deps with yarn.

`yarn`

Cool, now you need to build the shared libraries, see the section below about shared libraries to find out why.

`yarn workspace hsb-service-utils dev`

Kill the shared library build, and run the whole shebang together:

`yarn dev`

...aaand that's supposed to be it. If not, then, well, *It Works On My Machine* and I haven't gotten around to try it on others.

### running services separately

Look around `package.json` file in root and `docker-compose.dev.yml` to get things up and running separately, but the short version is that every service can be started independently with `yarn <service or package name without prefix> dev`.

There's also a `yarn dev-nodb` script that starts node services only, those are a lot quicker to start and kill than the mongo container. If you're using that, just start `yarn mongo`. This is probably the best way to work on this project.

As all javascript projects, this one shits the bed pretty often, too. If anything is off, you have yarn scripts that help with cleaning up: `yarn clean-builds` (which will delete yarn build and cache directories) and `yarn clean-node-modules` which will - shockingly I know - delete all node_modules folders throughout the project. You can do both with one `yarn clean` too.

### shared libraries

The `hsb-service-utils` package contains code shared between services. Other packages import the modules from the `build` directory in this package, so for anything to run these need to be built first. If you're running everything in dev mode, changes to shared code source are detected, and the bundle is rebuilt, but other services can't detect these changes, so you need to trigger rebuilds manually in them.

The preferred way of working on shared libs is by running a single module at a time. A good way to achieve this is using the [JavaScript REPL](https://marketplace.visualstudio.com/items?itemName=achil.vscode-javascript-repl) VS Code extension, and creating `*.sandbox.js` files - conveniently ignored by git - near modules you're working on, which can also double as tests until tests are set up. Once your 'tests' are green, bring up services and do some manual intergration testin'.

## auth in a nuthsell

Users are authenticated by the gateway service, and receive a user token (JWT) that will be used for sessionless authentication.

The user token is stored in a cookie, because this way it's not available in a client-side js context.

That's cool because the cookie containing the user token is sent with every request as long as we're staying
on the same domain (we are).

An expiring token can be refreshed by making a call to `/api/auth/renew-token`.

When token contents are needed, they can be fetched from `/api/auth/current-token`
