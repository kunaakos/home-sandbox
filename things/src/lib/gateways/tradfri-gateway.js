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

import { Thing } from '../things/thing'

const DEBUG = true

// NOTE: used during auth flow
export const discover = async () => {
    return await discoverGateway()
}

// NOTE: used during auth flow
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

const idOfTradfriDevice = device => `TRADFRI__${device.instanceId}`
const stateOfTradfriLight = device => device.lightList[0].onOff
const stateOfTradfriPlug = device => device.plugList[0].onOff

const switchFromTradfriLight = device => {

    const id = idOfTradfriDevice(device)
    DEBUG && console.log(`TRADFRI: adding light ${id}`)

    const setState = async newState => {
        DEBUG && console.log(`TRADFRI: turning light ${id} ${newState ? 'ON' : 'OFF'}`)
        await newState
            ? device.lightList[0].turnOn()
            : device.lightList[0].turnOff()
    }

    const values = {
        state: {
            get: () => stateOfTradfriLight(device),
            set: setState
        }
    }

    return Thing({
        type: 'switch',
        id,
        label: device.name,
        values
    })
}

const switchFromTradfriPlug = device => {

    const id = idOfTradfriDevice(device)
    DEBUG && console.log(`TRADFRI: adding plug ${id}`)

    const setState = async newState => {
        DEBUG && console.log(`TRADFRI: turning plug ${id} ${newState ? 'ON' : 'OFF'}`)
        await newState
            ? device.plugList[0].turnOn()
            : device.plugList[0].turnOff()
    }

    const values = {
        state: {
            get: () => stateOfTradfriPlug(device),
            set: setState
        }
    }

    return Thing({
        type: 'switch',
        id,
        label: device.name,
        values
    })
}

export const TradfriGateway = async ({
    things,
    gatewayAddressOrHost,
    identity,
    psk
}) => {

    DEBUG && console.log('TRADFRI: initializing')

    // called whenever a new TRADFRI device is connected
    // or an existing TRADFRI device's state is changed
    const onDeviceUpdated = device => {

        const id = idOfTradfriDevice(device)

        if (things.has(id)) {

            if (device.type === AccessoryTypes.lightbulb) {
                DEBUG && console.log(`TRADFRI: updating ${id} state.`)
                things.update(id)
                return
            }
            if (device.type === AccessoryTypes.plug) {
                things.update(id)
                return
            }
        } else {
            if (device.type === AccessoryTypes.lightbulb) {
                things.add(id, switchFromTradfriLight(device))
                return
            }
            if (device.type === AccessoryTypes.plug) {
                things.add(id, switchFromTradfriPlug(device))
                return
            }
        }
        
        DEBUG && console.log(`TRADFRI: found unsupported device type ${device.type} with id ${device.instanceId}`)
    }

    // called whenever a TRADFRI device is disconnected
    const onDeviceRemoved = instanceId => {
        things.remove(instanceId)
    }

    if (
        !gatewayAddressOrHost ||
        !identity ||
        !psk
    ) {
        throw new Error('Tradfri credentials not provided')
    } else {
        DEBUG && console.log('TRADFRI: credentials provided')
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
