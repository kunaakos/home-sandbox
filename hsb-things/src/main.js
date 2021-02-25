import { snakeCase, deburr } from 'lodash'

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
	readGatewayConfig,
	readGatewayConfigs,
	addGatewayConfig,
	readSubscriptions,
	addThingId,
	readThingIds,
	removeThingId
} from './db-queries'


const AUTOMATIONS_GATEWAY_ID = `4a4a4a4a-4a4a-4a4a-a4a4-a4a4a4a4a4a4` // hahaha

/**
 * Side effect-ey function that checks if creating the automations gateway is needed
 */ 
const checkForAUtomationsGateway = async () => {
	if (!(await readGatewayConfig(AUTOMATIONS_GATEWAY_ID))) {
		logger.info('adding automations gateway config to database')
		return await addGatewayConfig({
			id: AUTOMATIONS_GATEWAY_ID,
			type: 'automations-gateway',
			label: 'Automations',
			isActive: false,
			config: {}
		})
	}
}

const initializeVirtualThing = ({ thingConfig, publishChange }) => {

	const args = {
		publishChange,
		...thingConfig,
		fingerprint: `VIRTUAL__${snakeCase(deburr(thingConfig.label))}`,
		gatewayId: AUTOMATIONS_GATEWAY_ID,
		initialState: {}
	}

	switch (thingConfig.type) {

		case 'thermostat':
			return makeThermostat(args)

		default:
			throw new Error(`Unsupported thing config type '${type}'.`)

	}
}

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

		case 'automations':
			return;

		default:
			throw new Error(`Unsupported gateway config type '${type}'.`);
	}
}

const main = async () => {

	await checkForAUtomationsGateway()

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

	for (const thingConfig of thingConfigs) {
		await things.add(initializeVirtualThing({ thingConfig, publishChange }))
	}

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
