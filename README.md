# HOME 🏘 AUTOMATION 🤖 SANDBOX 💥

It's an experiment.

## services

things: interfaces with hardware and third party apis, serves a websocket api that the client can use to retreive up-to-date thing state

ui: gateway / web service - handles authentication, proxying, and server the client app

## dev

Look around `package.json` file in root and `docker-compose.dev.yml` to get things up and running.

Dependencies: yarn, docker and hopefully nothing else.

TODO: .env templates

## auth in a nuthsell

Users are authenticated by the gateway service, and receive a user token (JWT) that will be used for sessionless authentication.

The user token is stored in a cookie, because this way it's not available in a client-side js context.

That's cool because the cookie containing the user token is sent with every request as long as we're staying
on the same domain (we are).

An expiring token can be refreshed by making a call to `/renew-token`.

When token contents are needed, they can be fetched from `/current-token`
