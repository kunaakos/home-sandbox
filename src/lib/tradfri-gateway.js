/**
 * IKEA TRADFRI Gateway
 * Handles communication with a TRADFRI gateway.
 * Its sole responsibility is to register discovered devices as things,
 * it should not manipulate them in any other way.
 */

import {
    discoverGateway,
    TradfriClient,
    AccessoryTypes
} from "node-tradfri-client"

const DEBUG = true

export const discover = async () => {
    return await discoverGateway()
}

export const authenticate = async ({
    gatewayAddressOrHost,
    securityCode
}) => {
    try {
        const tradfriClient = new TradfriClient(gatewayAddressOrHost)
        const { identity, psk } = await tradfriClient.authenticate(securityCode)
        return { tradfriClient, identity, psk }
    } catch (e) {
        throw new Error(`Tradfri client authentication error: ${e.message}.`)
    }
}

export const connect = async ({
    gatewayAddressOrHost,
    identity,
    psk
}) => {
    try {
        const tradfriClient = new TradfriClient(
            gatewayAddressOrHost,
            {
                watchConnection: true,
                // customLogger: console.log
            }
        )
        await tradfriClient.connect(identity, psk)
        return tradfriClient
    } catch (e) {
        throw new Error(`Tradfri client connection error: ${e.message}.`)
    }
}

const switchFromTradfriLight = device => {

    const id = device.instanceId
    DEBUG && console.log(`TRADFRI: updating light ${id}`)

    return {
        type: 'switch',
        id: `${id}`,
        label: device.name,
        hidden: false,
        on: async () => {
            DEBUG && console.log(`TRADFRI: turning on light ${id}`)
            await device.lightList[0].turnOn()
        },
        off: async() => {
            DEBUG && console.log(`TRADFRI: turning off light ${id}`)
            await device.lightList[0].turnOff()

        },
        getState: () => device.lightList[0].onOff
    }
}

const switchFromTradfriPlug = device => {

    const id = device.instanceId
    DEBUG && console.log(`TRADFRI: adding plug ${id}`)

    return {
        type: 'switch',
        id: `${id}`,
        label: device.name,
        hidden: false,
        on: async () => {
            DEBUG && console.log(`TRADFRI: turning on plug ${id}`)
            await device.plugList[0].turnOn()
        },
        off: async() => {
            DEBUG && console.log(`TRADFRI: turning off plug ${id}`)
            await device.plugList[0].turnOff()

        },
        getState: () => device.plugList[0].onOff
    }
}

export const TradfriGateway = async ({
    things,
    gatewayAddressOrHost,
    identity,
    psk
}) => {

    DEBUG && console.log('TRAFRI: initializing')

    const onDeviceUpdated = device => {
        if (device.type === AccessoryTypes.lightbulb) {
            const switchie = switchFromTradfriLight(device)
            things.set(switchie.id, switchie)
            return
        }
        if (device.type === AccessoryTypes.plug) {
            const switchie = switchFromTradfriPlug(device)
            things.set(switchie.id, switchie)
            return
        }
        DEBUG && console.log(`TRADFRI: found unsupported device type ${device.type} with id ${device.instanceId}`)
    }

    const onDeviceRemoved = instanceId => {
        things.delete(instanceId)
    }

    if (
        !gatewayAddressOrHost ||
        !identity ||
        !psk
    ) {
        throw new Error('Tradfri credentials not provided')
    } else {
        DEBUG && console.log('TRAFRI: credentials provided')
    }

    const tradfriClient = await connect({
        gatewayAddressOrHost,
        identity,
        psk
    })

    tradfriClient
        .on('device updated', onDeviceUpdated)
        .on('device removed', onDeviceRemoved)
        .observeDevices()
    
    return {
        type: 'ikea-tradfri-gateway'
    }
}
