export const thingConfigs = [
    {
        type: 'gpio-pin',
        id: 'heat-request',
        label: 'Heat request',
        hidden: true,
        pinNr: 7
    },
    {
        type: 'thermostat',
        id: 'thermostat',
        label: 'Thermostat',
        hidden: false,
    },
    {
        type: 'adafruit-io-feed',
        id: 'aio-temp',
        label: 'adafruit.io "temperature" feed',
        hidden: true,
        username: process.env.AIO_USERNAME,
        aioKey: process.env.AIO_KEY,
        feedKey: process.env.AIO_FEED_KEY_TEMPERATURE
    },
    {
        type: 'adafruit-io-feed',
        id: 'aio-heat',
        label: 'adafruit.io "heat" feed',
        hidden: true,
        username: process.env.AIO_USERNAME,
        aioKey: process.env.AIO_KEY,
        feedKey: process.env.AIO_FEED_KEY_HEAT
    }
]

export const gatewayConfigs = [
    {
        type: 'serial-gateway',
        path: process.env.SERIAL_DEVICE_PATH
    },
    {
        type: 'tradfri-gateway',
        gatewayAddressOrHost: process.env.TRADFRI_ADDRESS,
        identity: process.env.TRADFRI_IDENTITY,
        psk: process.env.TRADFRI_PSK
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
