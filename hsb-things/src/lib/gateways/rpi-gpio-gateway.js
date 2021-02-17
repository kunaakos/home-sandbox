/**
 * Raspberry Pi GPIO Gateway
 * Currently supports output pins only, maps configured GPIO pins to switches.
 */

const gpio = process.env.THINGS__REAL_GPIO
	? require('rpi-gpio').promise
	: null

import { logger } from '../../logger'

import { makeSwitch } from '../things/switch'


// initialize pin as output and return async function that can be called to set pin state
const initOutputPin = async ({ pinNr }) => {
	gpio && await gpio.setup(pinNr, gpio.DIR_OUT)

	// return value is an effect function
	return async newState => {
		gpio && await gpio.write(pinNr, newState)
		logger.trace(`${gpio ? '' : 'mock '}GPIO pin '${pinNr}' set to ${newState}`)
		return newState
	}
}

export const makeRpiGpioGateway = ({
	description,
	config,
	things,
	publishChange
}) => {

	logger.info(`initializing GPIO gateway #${description.id}`)
	if (!gpio) {
		logger.warn(`GPIO not enabled, #${description.id} continuing in mock mode`)
	}

	const { things: thingConfigs } = config

	thingConfigs.forEach(async ({ id, label, hidden, pinNr }) => {

		const changeState = await initOutputPin({
			pinNr
		})
		await changeState(false) // OFF by default

		things.add(makeSwitch({
			description: {
				id,
				label,
				hidden,
			},
			initialState: {
				isOn: false
			},
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
