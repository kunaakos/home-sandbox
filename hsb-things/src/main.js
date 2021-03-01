import { logger } from './logger'

import { makeAutomationsGateway } from './lib/gateways/automations-gateway'
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
	readGatewayConfigs,
	readSubscriptions,
	addThingId,
	readThingIds,
	removeThingId
} from './db-queries'


const initializeGateway = async ({
	gatewayConfig,
	things,
	publishChange,
}) => {

	const args = {
		things,
		publishChange,
		...gatewayConfig
	}

	switch (gatewayConfig.type) {

		case 'tradfri':
			return await makeTradfriGateway(args)

		case 'serial':
			return await makeSerialGateway(args)

		case 'rpi-gpio':
			return await makeRpiGpioGateway(args)

		case 'aio':
			return await makeAioGateway(args)

		case 'mi-ble':
			return await makeMiBleGateway(args)

		default:
			throw new Error(`Unsupported gateway config type '${type}'.`);
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

	await makeAutomationsGateway({ things, publishChange })

	const gatewayConfigs = await readGatewayConfigs()
	for (const gatewayConfig of gatewayConfigs) {
		gatewayConfig.isActive && await initializeGateway({ gatewayConfig, things, publishChange })
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
