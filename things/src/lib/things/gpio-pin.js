import { Thing } from './thing'

const gpio = process.env.REAL_GPIO
	? require('rpi-gpio').promise
	: null

const DEBUG = true

export const GpioPin = async ({
	id,
	label,
	hidden,
	pinNr,
}) => {

	let pinState = false

	const updatePinState = async newState => {
		pinState = Boolean(newState)
		gpio && await gpio.write(pinNr, pinState)
		DEBUG && console.log(`GPIO: pin #${pinNr} set to ${pinState}`)
	}

	DEBUG && console.log(`GPIO: initializing using pin #${pinNr}`)
	gpio && await gpio.setup(pinNr, gpio.DIR_OUT)
	await updatePinState()

	const values = {
		state: {
			get: () => pinState,
			set: updatePinState
		}
	}

	return Thing({
		type: 'switch',
		id,
		label,
		hidden,
		values
	})
}
