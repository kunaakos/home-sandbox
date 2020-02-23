/**
 * Raspberry Pi GPIO Gateway
 * Currently supports output pins only, maps configured GPIO pins to switches.
 */

const gpio = process.env.REAL_GPIO
	? require('rpi-gpio').promise
	: null

import { makeSwitch } from '../things/switch'


// initialize pin as output and return async function that can be called to set pin state
const initOutputPin = async ({logger, pinNr}) => {
	gpio && await gpio.setup(pinNr, gpio.DIR_OUT)

	// return value is an effect function
	return async newState => {
		gpio && await gpio.write(pinNr, newState)
		logger.trace(`${gpio ? '' : 'mock '}GPIO pin '${pinNr}' set to ${newState}`)
		return newState
	}
}

export const makeRpiGpioGateway = ({
	logger,
	description,
	config,
	things,
	publishChange
}) => {

	logger.info(`initializing GPIO gateway #${description.id}`)
	if (!gpio) {
		logger.warn(`GPIO not enabled, #${description.id} continuing in mock mode`)
	}

	const { thingDefinitions } = config

	thingDefinitions.forEach(async ({ config, description, initialState }) => {

		const changeState = await initOutputPin({
			logger,
			pinNr: config.pinNr
		})
		await changeState(initialState.isOn)

		things.add(makeSwitch({
			logger,
			description,
			initialState,
			publishChange,
			effects: {
				changeState
			}
		}))

	})

	return {
		type: 'serial-gateway',
		id: description.id
	}
}
