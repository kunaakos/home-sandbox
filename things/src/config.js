export const thingDefinitions = [
    {
        type: 'gpio-pin',
        description: {
            id: 'heat-request',
            label: 'Heat request',
            hidden: true,
        },
        config: {
            pinNr: 7
        }
    },
    {
        type: 'thermostat',
        description: {
            id: 'thermostat',
            label: 'Thermostat',
            hidden: false,
        }
    },
    {
        type: 'adafruit-io-feed',
        description: {
            id: 'aio-temp',
            label: 'adafruit.io "temperature" feed',
            hidden: true,
        },
        config: {
            username: process.env.AIO_USERNAME,
            aioKey: process.env.AIO_KEY,
            feedKey: process.env.AIO_FEED_KEY_TEMPERATURE
        }
    },
    {
        type: 'adafruit-io-feed',
        description: {
            id: 'aio-heat',
            label: 'adafruit.io "heat" feed',
            hidden: true,
        },
        config: {
            username: process.env.AIO_USERNAME,
            aioKey: process.env.AIO_KEY,
            feedKey: process.env.AIO_FEED_KEY_HEAT
        }
    }
]

export const gatewayDefinitions = [
    {
        type: 'serial-gateway',
        description: {
            id: 'nrf24-serial',
            label: `NRF24 radio gateway attached to ${process.env.SERIAL_DEVICE_PATH}`
        },
        config: {
            path: process.env.SERIAL_DEVICE_PATH
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
    }
]

// NOTE: see things-store for schema
export const subscriptions = {
    'SERIAL__66': {
        'thermostat': {
            'temperature': 'currentTemperature'
        },
        'aio-temp': {
            'temperature': 'value'
        }
    },
    'thermostat': {
        'heat-request': {
            'heatRequest': 'state'
        }
    },
    // TODO: need to cast boolean to number...
    // 'heat-request': {
    //     'aio-heat': {
    //         'state': 'value'
    //     }
    // }
}
