import { makeGpioPin } from './lib/things/gpio-pin'
import { makeThermostat } from './lib/things/thermostat'
import { makeAioFeed } from './lib/things/aio-feed'
import { makeSerialGateway } from './lib/gateways/serial-gateway'
import { makeTradfriGateway } from './lib/gateways/tradfri-gateway'

import { makeThingStore } from './lib/thing-store'
import { handleSubscriptions } from './lib/thing-subscriptions'
import { makeThingEvents } from './lib/thing-events'

import { initializeWebsocketApi } from './websocket-api'

import {
	subscriptions,
	thingDefinitions,
	gatewayConfigs
} from './config'

const initializeThing = ({ publishChange }) => async ({ type, description, config }) => {

	switch (type) {

		case 'gpio-pin':
			return makeGpioPin({ description, config, publishChange, initialState: {} })

		case 'thermostat':
			return makeThermostat({ description, config, publishChange, initialState: {} })

		case 'adafruit-io-feed':
			return makeAioFeed({ description, config, publishChange, initialState: {} })

		default:
			throw new Error(`Unsupported thing config: ${type}.`)

	}
}

const initializeGateway = async config => {

	switch (config.type) {

		case 'tradfri-gateway':
			return makeTradfriGateway(config)

		case 'serial-gateway':
			return makeSerialGateway(config)

		default:
			throw new Error(`Unsupported gateway config: ${config.type}.`)

	}

}

const main = async () => {

	const {
		publishChange,
		subscribeToChanges,
		unsubscribeFromChanges
	} = makeThingEvents()

	const things = makeThingStore({
		publishChange
	})

	handleSubscriptions({
		subscriptions,
		things,
		subscribeToChanges
	})

	const initializeThingWithDeps = initializeThing({ publishChange })
	thingDefinitions.forEach(async thingDefinition => { things.add(await initializeThingWithDeps(thingDefinition)) })

	const injectGatewayDependencies = config => ({ ...config, things, publishChange })
	gatewayConfigs.forEach(async gatewayConfig => await initializeGateway(injectGatewayDependencies(gatewayConfig)))

	initializeWebsocketApi({
		things,
		subscribeToChanges,
		unsubscribeFromChanges
	})

}

main().catch(console.error)
