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

import { makeThing } from '../thing'

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
	newState
		? await device.lightList[0].turnOn()
		: await device.lightList[0].turnOff()
}

const mapTradfriLightbulbToSwitchState = device => ({
	state: getTradfriLightbulbState(device)
})

const makeSwitchFromTradfriLightbulb = async device => {

	const id = thingIdFrom(device.instanceId)
	DEBUG && console.log(`TRADFRI LIGHTBULB: initializing/updating ${id}`)

	const { state } = mapTradfriLightbulbToSwitchState(device)

	return makeThing({
		type: 'switch',
		description: {
			id,
			label: labelFrom(device),
			hidden: false,
		},
		publishChange: () => {}
	})({
		state: {
			get: () => state,
			set: async newState => {
				if (state === Boolean(newState)) { return false }
				await setTradfriLightbulbState(device, Boolean(newState)) // this will eventually trigger a tradfri lib 'device updated' event, watch out for loops
				DEBUG && console.log(`TRADFRI LIGHTBULB: ${id} set to ${state}`)
				return false // TODO: thing instances created by the tradfri gatewat are nuked after evert state change so changes should not be propagated
			}
		}
	})
}

const getTradfriPlugState = device => device.plugList[0].onOff
const setTradfriPlugState = async (device, newState) => {
	newState
		? await device.plugList[0].turnOn()
		: await device.plugList[0].turnOff()
}

const mapTradfriPlugToSwitchState = device => ({
	state: getTradfriPlugState(device)
})

const makeSwitchFromTradfriPlug = async device => {

	const id = thingIdFrom(device.instanceId)
	DEBUG && console.log(`TRADFRI PLUG: initializing/updating ${id}`)

	let { state } = mapTradfriPlugToSwitchState(device)

	return makeThing({
		type: 'switch',
		description: {
			id,
			label: labelFrom(device),
			hidden: false,
		},
		publishChange: () => {}
	})({
		state: {
			get: () => state,
			set: async newState => {
				if (state === Boolean(newState)) { return false }
				await setTradfriPlugState(device, Boolean(newState)) // this will eventually trigger a tradfri lib 'device updated' event, watch out for loops
				DEBUG && console.log(`TRADFRI PLUG: ${id} set to ${state}`)
				return false // TODO: thing instances created by the tradfri gatewat are nuked after evert state change so changes should not be propagated
			}
		}
	})
}

export const makeTradfriGateway = async ({
	description,
	config,
	things
}) => {

	DEBUG && console.log('TRADFRI: initializing')

	const unsupportedInstanceIds = []

	// The tradfri lib has a weird thing going on, so right now
	// things are completely replaced on every state change
	// because refs to fns like "device.plugList[0].turnOn()"
	// stopped working after a state change and keeping tradfri lib and
	// app state in sync was painful.
	// This works, might cause a memory leak, revisit if it does.
	const addOrReplaceThing = async device => {
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

	// NOTE: not yet tested
	const removeThing = instanceId => {
		const thingId = thingIdFrom(instanceId)
		things.remove(thingId)
		unsupportedInstanceIds = unsupportedInstanceIds.filter(unsupportedInstanceId => unsupportedInstanceId !== instanceId)
	}

	const {
		gatewayAddressOrHost,
		identity,
		psk
	} = config

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
				if (unsupportedInstanceIds.includes(device.instanceId)) {
					// unsupported device updated, do nothing
				} else {
					addOrReplaceThing(device)
				}
			})
			.on('device removed', removeThing)
			.on('error', console.error)
			.observeDevices()
		DEBUG && console.log('TRADFRI: credentials provided')
	}

	return {
		type: 'ikea-tradfri-gateway',
		id: description.id
	}
}
