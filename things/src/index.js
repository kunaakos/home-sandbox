import { logger } from './logger'

import { makeThermostat } from './lib/things/thermostat'

import { makeSerialGateway } from './lib/gateways/serial-gateway'
import { makeTradfriGateway } from './lib/gateways/tradfri-gateway'
import { makeRpiGpioGateway } from './lib/gateways/rpi-gpio-gateway'
import { makeAioGateway } from './lib/gateways/aio-gateway'

import { makeThingStore } from './lib/thing-store'
import { makeThingEvents } from './lib/thing-events'
import { handleSubscriptions } from './lib/thing-subscriptions'

import { initializeWebsocketApi } from './websocket-api'

import {
	subscriptions,
	thingDefinitions,
	gatewayDefinitions
} from './config'

const initializeThing = deps => thingDefinition => {

	const args = {
		...deps,
		...thingDefinition,
		initialState: {}
	}

	switch (thingDefinition.type) {

		case 'thermostat':
			return makeThermostat(args)

		default:
			throw new Error(`Unsupported thing config type '${type}'.`)

	}
}

const initializeGateway = deps => gatewayDefinition => {

	const args = {
		...deps,
		...gatewayDefinition
	}

	switch (gatewayDefinition.type) {

		case 'tradfri-gateway':
			return makeTradfriGateway(args)

		case 'serial-gateway':
			return makeSerialGateway(args)

		case 'rpi-gpio-gateway':
			return makeRpiGpioGateway(args)

		case 'aio-gateway':
			return makeAioGateway(args)

		default:
			throw new Error(`Unsupported gateway config type '${type}'.`)

	}

}

const startApp = async () => {

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
	thingDefinitions.forEach(thingDefinition => { things.add(initializeThingWithDeps(thingDefinition)) })

	const initializeGatewayWithDeps = initializeGateway({ things, publishChange })
	gatewayDefinitions.forEach(gatewayDefinition => { initializeGatewayWithDeps(gatewayDefinition) })

	initializeWebsocketApi({
		things,
		subscribeToChanges,
		unsubscribeFromChanges
	})

}

const fatalErrorHandler = message => error => {
	logger.fatal(error, message)
	process.exit(1)
}

process.on('uncaughtException', fatalErrorHandler('uncaught exception'))
process.on('unhandledRejection', fatalErrorHandler('unhandled promise rejection'))
startApp().catch(fatalErrorHandler('application error'))
