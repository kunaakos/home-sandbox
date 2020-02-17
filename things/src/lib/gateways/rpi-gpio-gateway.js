/**
 * Raspberry Pi GPIO Gateway
 * Currently supports output pins only, maps configured GPIO pins to switches.
 */

const gpio = process.env.REAL_GPIO
	? require('rpi-gpio').promise
	: null

import { makeSwitch } from '../things/switch'

const DEBUG = true

// initialize pin as output and return async function that can be called to set pin state
const initOutputPin = async pinNr => {
	gpio && await gpio.setup(pinNr, gpio.DIR_OUT)
	return async newState => {
		gpio && await gpio.write(pinNr, newState)
		DEBUG && console.log(`RPI GPIO: pin #${pinNr} set to ${newState}`)
		return true
	}
}

export const makeRpiGpioGateway = ({
	description,
	config,
	things,
	publishChange
}) => {

	DEBUG && console.log(`RPI GPIO: initializing${gpio ? '' : ' in mock mode'}`)

	const { thingDefinitions } = config

	thingDefinitions.forEach(async ({ config, description, initialState }) => {

		const changeState = await initOutputPin(config.pinNr)
		await changeState(initialState.isOn)

		things.add(await makeSwitch({
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
