import { GpioPin } from './lib/things/gpio-pin'
import { Thermostat } from './lib/things/thermostat'
import { AioFeed } from './lib/things/aio-feed'
import { SerialGateway } from './lib/gateways/serial-gateway'
import { TradfriGateway } from './lib/gateways/tradfri-gateway'

import { ThingStore } from './lib/thing-store'

import { thingConfigs, subscriptions } from './config'


const initializeWithDependencies = (dependencies) => {

	const injectDependencies = config => ({ ...config, ...dependencies })

	return async config => {

		switch (config.type) {
	
			case 'gpio-pin':
				return GpioPin(config)
	
			case 'thermostat':
				return Thermostat(injectDependencies(config))
	
			case 'adafruit-io-feed':
				return AioFeed(config)
	
			case 'tradfri-gateway':
				return TradfriGateway(injectDependencies(config))
	
			case 'serial-gateway':
				return SerialGateway(injectDependencies(config))
	
			default:
				throw new Error(`Unsupported thing config: ${config.type}.`)
	
		}
	}
}

const main = async () => {

	const things = ThingStore({ subscriptions })

	const initialize = initializeWithDependencies({ things })

	// synchronously init things and gateways in the order configs were declared in
	for (let config of thingConfigs.values()) {
		const thingOrGateway = await initialize(config)
		// NOTE: things have ids, gateways don't
		// this is a temporary solution for differentiating between them
		if (thingOrGateway.id) {
			things.add(thingOrGateway.id, thingOrGateway)
		}
	}

}

main().catch(console.error)
