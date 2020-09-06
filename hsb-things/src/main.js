import { logger } from './logger'

import { makeThermostat } from './lib/things/thermostat'

import { makeSerialGateway } from './lib/gateways/serial-gateway'
import { makeTradfriGateway } from './lib/gateways/tradfri-gateway'
import { makeRpiGpioGateway } from './lib/gateways/rpi-gpio-gateway'
import { makeAioGateway } from './lib/gateways/aio-gateway'
import { makeMiBleGateway } from './lib/gateways/mi-ble-gateway'

import { makeThingStore } from './lib/thing-store'
import { makeThingEvents } from './lib/thing-events'
import { handleSubscriptions } from './lib/thing-subscriptions'

import { initializeGqlServer } from './graphql-server'

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
		
		case 'mi-ble-gateway':
			return makeMiBleGateway(args)

		default:
			throw new Error(`Unsupported gateway config type '${type}'.`)

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
	thingDefinitions.forEach(thingDefinition => { things.add(initializeThingWithDeps(thingDefinition)) })

	const initializeGatewayWithDeps = initializeGateway({ things, publishChange })
	gatewayDefinitions.forEach(gatewayDefinition => { initializeGatewayWithDeps(gatewayDefinition) })

	initializeGqlServer({
		things
	})

}

const fatalErrorHandler = message => error => {
	logger.fatal(error, message)
	process.exit(1)
}

process.on('uncaughtException', fatalErrorHandler('uncaught exception'))
process.on('unhandledRejection', fatalErrorHandler('unhandled promise rejection'))
main().catch(fatalErrorHandler('application error'))
