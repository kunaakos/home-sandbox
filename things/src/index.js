import { makeGpioPin } from './lib/things/gpio-pin'
import { makeThermostat } from './lib/things/thermostat'
import { makeAioFeed } from './lib/things/aio-feed'
import { makeSerialGateway } from './lib/gateways/serial-gateway'
import { makeTradfriGateway } from './lib/gateways/tradfri-gateway'

import { makeThingStore } from './lib/thing-store'
import { thingStateChanged, onThingStateChanged } from './lib/thing-tools'
import { handleSubscriptions } from './lib/thing-subscriptions'

import { initializeWebsocketApi } from './websocket-api'

import {
	subscriptions,
	thingConfigs,
	gatewayConfigs
} from './config'

const initializeThing = async config => {

	switch (config.type) {

		case 'gpio-pin':
			return makeGpioPin(config)

		case 'thermostat':
			return makeThermostat(config)

		case 'adafruit-io-feed':
			return makeAioFeed(config)
		default:
			throw new Error(`Unsupported gateway config: ${config.type}.`)

	}
}

const initializeGateway = async config => {

	switch (config.type) {

		case 'tradfri-gateway':
			return makeTradfriGateway(config)

		case 'serial-gateway':
			return makeSerialGateway(config)

		default:
			throw new Error(`Unsupported thing config: ${config.type}.`)

	}

}

const main = async () => {

	const things = makeThingStore({
		thingStateChanged
	})

	handleSubscriptions({
		subscriptions,
		things,
		onThingStateChanged
	})

	thingConfigs.forEach(async thingConfig => {
		things.add(await initializeThing(thingConfig))
	})

	const injectGatewayDependencies = config => ({ ...config, things, thingStateChanged })
	gatewayConfigs.forEach(async gatewayConfig => {
		await initializeGateway(injectGatewayDependencies(gatewayConfig))
	})

	initializeWebsocketApi({
		things,
		onThingStateChanged
	})

}

main().catch(console.error)
