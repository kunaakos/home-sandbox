/**
 * IKEA TRADFRI Gateway
 * Handles communication with a TRADFRI gateway.
 * Creates things and updates them.
 */

import clamp from 'lodash/clamp'

import {
	discoverGateway,
	TradfriClient,
	AccessoryTypes
} from "node-tradfri-client"

import { logger } from '../../logger'

import { makeSwitch } from "../things/switch"
import { makeLight } from "../things/light"

const TRADFRI_COLORS = [
	'dcf0f8',
	'eaf6fb',
	'f5faf6',
	'f2eccf',
	'f1e0b5',
	'efd275',
	'ebb63e',
	'e78834',
	'e57345',
	'da5d41',
	'dc4b31',
	'e491af',
	'e8bedd',
	'd9337c',
	'c984bb',
	'8f2686',
	'4a418a',
	'6c83ba',
	// 'a9d62b', // this one is shite
	'd6e44b',
]

// NOTE: used during auth flow
export const discover = async () => {
	return await discoverGateway()
}

// NOTE: used during auth flow
export const authenticate = async ({
	gatewayAddressOrHost,
	securityCode
}) => {
	const tradfriClient = new TradfriClient(gatewayAddressOrHost)
	const { identity, psk } = await tradfriClient.authenticate(securityCode)
	return { tradfriClient, identity, psk }
}

export const connect = async ({
	customLogger,
	gatewayAddressOrHost,
	identity,
	psk
}) => {
	const tradfriClient = new TradfriClient(
		gatewayAddressOrHost,
		{
			watchConnection: true,
			customLogger
		}
	)
	await tradfriClient.connect(identity, psk)
	return tradfriClient
}

const thingIdFrom = instanceId => `TRADFRI__${instanceId}`
const labelFrom = device => device.name

const getTradfriLightbulbState = device => device.lightList[0].onOff
const setTradfriLightbulbState = device => async newState => {
	newState
		? await device.lightList[0].turnOn()
		: await device.lightList[0].turnOff()
	return null
}

const getTradfriLightbulbBrightness = device => device.lightList[0].dimmer
const setTradfriLightbulbBrightness = device => async brightness => {
	await device.lightList[0].setBrightness(brightness)
	return null
}

const getTradfriLightbulbColor = device => device.lightList[0].color
const setTradfriLightbulbColor = device => async color => {
	await device.lightList[0].setColor(color)
	return null
}

// the tradfri client api takes a value between 0 and 100, where 0 stands for 4000k and 100 stands for 2200k
const getTradfriLightbulbColorTemperature = device => Math.abs(100 - device.lightList[0].colorTemperature) * 18 + 2200
const setTradfriLightbulbColorTemperature = device => async colorTemperature => {
	const percentage = Math.abs(100 - Math.round((clamp(colorTemperature, 2200, 4000) - 2200) / 18))
	await device.lightList[0].setColorTemperature(percentage)
	return null
}

const makeLightFromTradfriLightbulb = ({ device, gatewayId }) => {

	const isDimmable = device.lightList[0].isDimmable
	const isColor = device.lightList[0].spectrum === 'rgb'
	const isAdjustableColorTemperature = device.lightList[0].spectrum === 'white'

	return makeLight({
		fingerprint: thingIdFrom(device.instanceId),
		gatewayId,
		label: labelFrom(device),
		isHidden: false,
		isDimmable,
		isColor,
		...(isAdjustableColorTemperature && { colorTemperatureRange: [2200, 4000] }),
		initialState: {
			isOn: getTradfriLightbulbState(device),
			...(isDimmable && { brightness: getTradfriLightbulbBrightness(device) }),
			...(isColor && {
				color: getTradfriLightbulbColor(device),
				availableColors: TRADFRI_COLORS,
			}),
			...(isAdjustableColorTemperature && { colorTemperature: getTradfriLightbulbColorTemperature(device) })
		},
		effects: {
			changeState: setTradfriLightbulbState(device),
			...(isDimmable && { changeBrightness: setTradfriLightbulbBrightness(device) }),
			...(isColor && { changeColor: setTradfriLightbulbColor(device) }),
			...(isAdjustableColorTemperature && { changeColorTemperature: setTradfriLightbulbColorTemperature(device) })
		}
	})

}

const getTradfriPlugState = device => device.plugList[0].onOff
const setTradfriPlugState = device => async newState => {
	newState
		? await device.plugList[0].turnOn()
		: await device.plugList[0].turnOff()
	return null
}

const makeSwitchFromTradfriPlug = ({ device, gatewayId }) =>
	makeSwitch({
		fingerprint: thingIdFrom(device.instanceId),
		gatewayId,
		label: labelFrom(device),
		isHidden: false,
		initialState: {
			isOn: getTradfriPlugState(device)
		},
		effects: {
			changeState: setTradfriPlugState(device)
		}
	})

export const makeTradfriGateway = async ({
	id,
	config,
	things
}) => {

	logger.info(`initializing IKEA Tradfri gateway #${id}`)

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
				logger.debug(`IKEA Tradfri gateway #${id} re-initializing light #${thingIdFrom(device.instanceId)}`)
				await things.add(makeLightFromTradfriLightbulb({ device, gatewayId: id }))
				break
			case AccessoryTypes.plug:
				logger.debug(`IKEA Tradfri gateway #${id} re-initializing switch #${thingIdFrom(device.instanceId)}`)
				await things.add(makeSwitchFromTradfriPlug({ device, gatewayId: id }))
				break

			default:
				unsupportedInstanceIds.push(device.instanceId)
				logger.debug(`IKEA Tradfri gateway #${id} found unsupported device type '${device.type}' with id #${device.instanceId}`)
				break
		}
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
		logger.warn(`IKEA Tradfri gateway #${id} credentials not provided, continuing in mock mode`)
	} else {
		connect({
			// customLogger: msg => logger.trace(`NODE-TRADFRI: ${msg}`),
			gatewayAddressOrHost,
			identity,
			psk
		})
			.then(async tradfriClient => {

				tradfriClient
					.on('device updated', async device => {
						try {
							if (unsupportedInstanceIds.includes(device.instanceId)) {
								// unsupported device updated, do nothing
							} else {
								await addOrReplaceThing(device)
							}
						} catch (error) {
							logger.error(error, `error updating IKEA Tradfri device ${device.instanceId}`)
						}
					})
					.on('device removed', instanceId => {
						try {
							const thingId = thingIdFrom(instanceId)
							things.remove(thingId)
							unsupportedInstanceIds = unsupportedInstanceIds.filter(unsupportedInstanceId => unsupportedInstanceId !== instanceId)
						} catch (error) {
							logger.error(error, `error removing IKEA Tradfri device ${device.instanceId}`)

						}
					})
					.on('error', error => logger.error(error, 'caught \'node-tradfri-client\' error'))
					.observeDevices()

				logger.info(`IKEA Tradfri gateway #${id} connected`)

			})
			.catch(err => logger.error(err, 'error connecting to IKEA Tradfri gateway'))
	}

}
