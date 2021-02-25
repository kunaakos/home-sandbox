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

import { thingConfigs } from './config'

import {
	readGatewayConfigs,
	readSubscriptions,
	addThingId,
	readThingIds,
	removeThingId
} from './db-queries'

const initializeThing = deps => thingConfig => {

	const args = {
		...deps,
		...thingConfig,
		initialState: {}
	}

	switch (thingConfig.type) {

		case 'thermostat':
			return makeThermostat(args)

		default:
			throw new Error(`Unsupported thing config type '${type}'.`)

	}
}

const initializeGateway = deps => async ({ type, id, label, config }) => {

	const args = {
		...deps,
		description: {
			id,
			label
		},
		config: config
	}

	switch (type) {

		case 'tradfri-gateway':
			return await makeTradfriGateway(args)

		case 'serial-gateway':
			return await makeSerialGateway(args)

		case 'rpi-gpio-gateway':
			return await makeRpiGpioGateway(args)

		case 'aio-gateway':
			return await makeAioGateway(args)
		
		case 'mi-ble-gateway':
			return await makeMiBleGateway(args)

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

	const things = await makeThingStore({
		publishChange,
		addThingId,
		readThingIds,
		removeThingId
	})

	const subscriptions = await readSubscriptions()
	handleSubscriptions({
		subscriptions,
		things,
		subscribeToChanges
	})

	// const initializeThingWithDeps = initializeThing({ publishChange })
	// for (const thingConfig of thingConfigs) {
	// 	await things.add(initializeThingWithDeps(thingConfig))
	// }

	const gatewayConfigs = await readGatewayConfigs()
	const initializeGatewayWithDeps = initializeGateway({ things, publishChange })
	for (const gatewayConfig of gatewayConfigs) {
		gatewayConfig.isActive && await initializeGatewayWithDeps(gatewayConfig)
	}

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
