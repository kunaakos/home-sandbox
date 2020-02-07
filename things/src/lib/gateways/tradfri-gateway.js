/**
 * IKEA TRADFRI Gateway
 * Handles communication with a TRADFRI gateway.
 * Creates things and updates them.
 */

import {
	discoverGateway,
	TradfriClient,
	AccessoryTypes
} from "node-tradfri-client"

import {
	makeThingTools
} from '../thing-tools'

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

const thingIdFrom = instanceId => `TRADFRI__${instanceId}`
const labelFrom = device => device.name

const getTradfriLightbulbState = device => device.lightList[0].onOff
const setTradfriLightbulbState = async (device, newState) => {
	await newState
		? device.lightList[0].turnOn()
		: device.lightList[0].turnOff()
}

const mapTradfriLightbulbToSwitchState = device => ({
	state: getTradfriLightbulbState(device)
})

const makeSwitchFromTradfriLightbulb = async device => {

	const id = thingIdFrom(device.instanceId)
	DEBUG && console.log(`TRADFRI LIGHTBULB: initializing ${id}`)

	const { makeThing } = makeThingTools({
		type: 'switch',
		id,
		label: labelFrom(device)
	})

	let { state } = mapTradfriLightbulbToSwitchState(device)

	return makeThing({
		state: {
			get: () => state,
			set: async newState => {
				if (state === !!newState) { return false }
				state = Boolean(newState)
				await setTradfriLightbulbState(device, newState) // this will eventually trigger a tradfri lib 'device updated' event, watch out for loops
				DEBUG && console.log(`TRADFRI LIGHTBULB: ${id} set to ${state}`)
				return false // state change will be advertised by TradfriGateway
			}
		}
	})
}

const getTradfriPlugState = device => device.plugList[0].onOff
const setTradfriPlugState = async (device, newState) => {
	await newState
		? device.plugList[0].turnOn()
		: device.plugList[0].turnOff()
}

const mapTradfriPlugToSwitchState = device => ({
	state: getTradfriPlugState(device)
})

const makeSwitchFromTradfriPlug = async device => {

	const id = thingIdFrom(device.instanceId)
	DEBUG && console.log(`TRADFRI PLUG: initializing ${id}`)

	const { makeThing } = makeThingTools({
		type: 'switch',
		id,
		label: labelFrom(device)
	})

	let { state } = mapTradfriPlugToSwitchState(device)

	return makeThing({
		state: {
			get: () => state,
			set: async newState => {
				if (state === !!newState) { return false }
				state = Boolean(newState)
				await setTradfriPlugState(device, newState) // this will eventually trigger a tradfri lib 'device updated' event, watch out for loops
				DEBUG && console.log(`TRADFRI PLUG: ${id} set to ${state}`)
				return false // state change will be advertised by TradfriGateway
			}
		}
	})
}

export const makeTradfriGateway = async ({
	things,
	thingStateChanged,
	gatewayAddressOrHost,
	identity,
	psk
}) => {

	DEBUG && console.log('TRADFRI: initializing')

	const unsupportedInstanceIds = []

	const addNew = async device => {
		switch (device.type) {
			case AccessoryTypes.lightbulb:
				things.add(await makeSwitchFromTradfriLightbulb(device))
				break
			case AccessoryTypes.plug:
				things.add(await makeSwitchFromTradfriPlug(device))
				break

			default:
				unsupportedInstanceIds.push(device.instanceId)
				DEBUG && console.log(`TRADFRI: found unsupported device type ${device.type} with id ${device.instanceId}`)
				break
		}
	}

	const updateExisting = async device => {
		switch (device.type) {
			case AccessoryTypes.lightbulb:
				await things.set(thingIdFrom(device.instanceId), mapTradfriLightbulbToSwitchState(device))
				thingStateChanged(thingIdFrom(device.instanceId))()
				break
			case AccessoryTypes.plug:
				await things.set(thingIdFrom(device.instanceId), mapTradfriPlugToSwitchState(device))
				thingStateChanged(thingIdFrom(device.instanceId))()
				break

		}
	}

	const removeExisting = instanceId => {
		const thingId = thingIdFrom(instanceId)
		things.remove(thingId)
		unsupportedInstanceIds = unsupportedInstanceIds.filter(unsupportedInstanceId => unsupportedInstanceId !== instanceId)
	}

	if (
		!gatewayAddressOrHost ||
		!identity ||
		!psk
	) {
		DEBUG && console.log('TRADFRI: credentials not provided, continuing in mock mode')
	} else {
		const tradfriClient = await connect({
			gatewayAddressOrHost,
			identity,
			psk
		})

		tradfriClient
			.on('device updated', device => {
				const id = thingIdFrom(device.instanceId)
				if (things.has(id)) {
					updateExisting(device)
				} else if (unsupportedInstanceIds.includes(device.instanceId)) {
					// unsupported device updated, do nothing
				} else {
					addNew(device)
				}
			})
			.on('device removed', removeExisting)
			.observeDevices()
		DEBUG && console.log('TRADFRI: credentials provided')
	}

	return {
		type: 'ikea-tradfri-gateway'
	}
}
