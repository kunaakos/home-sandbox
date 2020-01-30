import EventEmitter from 'events'

import { Relay } from './lib/relay'
import { Thermostat } from './lib/thermostat'
import { Nrf24Gateway } from './lib/nrf24-gateway'
import { AioFeed } from './lib/aio'
import { WebInterface } from './web/web-interface'
import { TradfriGateway } from './lib/tradfri-gateway'

import { thingConfigs, subscriptions } from './config'

const errorHandler = error => console.error(error)

const messageHandler = things => message => {
	if (subscriptions[message.sourceId]) {
		subscriptions[message.sourceId].forEach(targetId => {
			const thing = things.get(targetId)
			thing && thing.processMessage && thing.processMessage(message)
		})
	}
}

const initializeWithDependencies = (dependencies) => {

	const injectDependencies = config => ({ ...config, ...dependencies })

	return async config => {

		switch (config.type) {
	
			case 'relay':
				return Relay(config)
	
			case 'thermostat':
				return Thermostat(injectDependencies(config))
	
			case 'adafruitiofeed':
				return AioFeed(config)
	
			case 'tradfrigateway':
				return TradfriGateway(injectDependencies(config))
	
			case 'nrf24gateway':
				return Nrf24Gateway(injectDependencies(config))
	
			default:
				throw new Error('Unsupported thing config.')
	
		}
	}
}

const main = async () => {

	const things = new Map()
	const events = new EventEmitter

	events.on('message', messageHandler(things))

	const initialize = initializeWithDependencies({ things, events, errorHandler })

	// synchronously init things and gateways in the order configs were declared in
	for (let config of thingConfigs.values()) {
		const thingOrGateway = await initialize(config)
		// NOTE: things have ids, gateways don't
		// this is a temporary solution for differentiating between them
		if (thingOrGateway.id) {
			things.set(thingOrGateway.id, thingOrGateway)
		}
	}

	// the web interface / API is neither a thing nor a gateway
	WebInterface({
		things,
		port: process.env.WEB_UI_PORT || 80
	})

}

main().catch(console.error)
