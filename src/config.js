export const thingConfigs = new Map([
    [
        'heatrelay',
        {
            type: 'relay',
            id: 'heatrelay',
            label: 'Home heat switch',
            hidden: true,
            pinNr: 7
        }
    ],
    [
        'thermostat',
        {
            type: 'thermostat',
            id: 'homethermostat',
            label: 'Home',
            heatSwitchId: 'heatrelay'
        }
    ],
    [
        'serialgateway',
        {
            type: 'serialgateway',
            path: process.env.SERIAL_DEVICE_PATH,
            idMap: {
                77: 'ROOM_TEMPERATURE', // mester
                66: 'ROOM_TEMPERATURE', // angyalfoldi
                55: 'BATHROOM_TEMPERATURE' // angyalfoldi
            }
        }
    ],
    [
        'tradfrigateway',
        {
            type: 'tradfrigateway',
            gatewayAddressOrHost: process.env.TRADFRI_ADDRESS,
            identity: process.env.TRADFRI_IDENTITY,
            psk: process.env.TRADFRI_PSK
        }
    ],
    [
        'aiotemp',
        {
            type: 'adafruitiofeed',
            id: 'aiotemp',
            label: 'AIO: temperature feed',
            username: process.env.AIO_USERNAME,
            aioKey: process.env.AIO_KEY,
            feedKey: process.env.AIO_FEED_KEY_TEMPERATURE
        }
    ],
    [
        'aioheat',
        {
            type: 'adafruitiofeed',
            id: 'aioheat',
            label: 'AIO: heat state feed',
            username: process.env.AIO_USERNAME,
            aioKey: process.env.AIO_KEY,
            feedKey: process.env.AIO_FEED_KEY_HEAT
        }
    ]
])

export const subscriptions = {
    'SERIAL__ROOM_TEMPERATURE': ['homethermostat'],
}
