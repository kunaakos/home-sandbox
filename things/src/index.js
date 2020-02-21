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

const initializeThing = ({ publishChange }) => ({ type, description, config }) => {

	switch (type) {

		case 'thermostat':
			return makeThermostat({ description, config, publishChange, initialState: {} })

		default:
			throw new Error(`Unsupported thing config: ${type}.`)

	}
}

const initializeGateway = ({ publishChange, things }) => ({ type, description, config }) => {

	switch (type) {

		case 'tradfri-gateway':
			return makeTradfriGateway({ description, config, publishChange, things })

		case 'serial-gateway':
			return makeSerialGateway({ description, config, publishChange, things })

		case 'rpi-gpio-gateway':
			return makeRpiGpioGateway({ description, config, publishChange, things })

		case 'aio-gateway':
			return makeAioGateway({ description, config, publishChange, things })

		default:
			throw new Error(`Unsupported gateway config: ${type}.`)

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

	initializeWebsocketApi({
		things,
		subscribeToChanges,
		unsubscribeFromChanges
	})

}

main().catch(console.error)
