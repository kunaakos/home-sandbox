const FIVE_MINUTES = 5 * 60 * 1000

export const thingDefinitions = [
	{
		type: 'thermostat',
		description: {
			id: 'thermostat',
			label: 'Thermostat',
			hidden: false,
		}
	}
]

export const gatewayDefinitions = [
	{
		type: 'serial-gateway',
		description: {
			id: 'nrf24-serial',
			label: `NRF24 radio gateway attached to ${process.env.THINGS__SERIAL_DEVICE_PATH}`
		},
		config: {
			path: process.env.THINGS__SERIAL_DEVICE_PATH
		}
	},
	{
		type: 'tradfri-gateway',
		description: {
			id: 'tradfri',
			label: `IKEA TRADFRI Gateway at ${process.env.TRADFRI_ADDRESS}`
		},
		config: {
			gatewayAddressOrHost: process.env.TRADFRI_ADDRESS,
			identity: process.env.TRADFRI_IDENTITY,
			psk: process.env.TRADFRI_PSK
		}
	},
	{
		type: 'rpi-gpio-gateway',
		description: {
			id: 'rpi-gpio',
			label: `devices connected to GPIO pins`
		},
		config: {
			thingDefinitions: [
				{
					description: {
						id: 'heat-request',
						label: 'Heat request',
						hidden: true
					},
					config: {
						pinNr: 7
					},
					initialState: {
						isOn: false
					}
				}
			]
		}
	},
	{
		type: 'aio-gateway',
		description: {
			id: 'aio',
			label: `adafruit.io feeds`
		},
		config: {
			username: process.env.AIO_USERNAME,
			aioKey: process.env.AIO_KEY,
			groupKey: process.env.AIO_FEED_GROUP_KEY,
			feeds: [
				{
					key: 'targetTemperature',
					feedKey: process.env.AIO_FEED_KEY_TARGET_TEMPERATURE,
					reportOnUpdate: true,
					reportInterval: FIVE_MINUTES

				},
				{
					key: 'currentTemperature',
					feedKey: process.env.AIO_FEED_KEY_TEMPERATURE,
					reportOnUpdate: true
				},
				{
					key: 'heatRequest',
					feedKey: process.env.AIO_FEED_KEY_HEAT,
					reportOnUpdate: true,
					reportInterval: FIVE_MINUTES
				}
			]
		}
	}
]

// NOTE: see things-subscriptions for schema
export const subscriptions = {
	'SERIAL__66': {
		'thermostat': [
			['temperature', 'currentTemperature']
		]
	},
	'thermostat': {
		'heat-request': [
			['heatRequest', 'isOn']
		],
		'aio-feeds': [
			['currentTemperature', 'currentTemperature'],
			['targetTemperature', 'targetTemperature'],
			['heatRequest', 'heatRequest']
		]
	}
}
