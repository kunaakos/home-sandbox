import { makeThing } from '../thing-tools'

const gpio = process.env.REAL_GPIO
	? require('rpi-gpio').promise
	: null

const DEBUG = true

export const makeGpioPin = async ({
	id,
	label,
	hidden,
	publishChange,
	pinNr
}) => {

	DEBUG && console.log(`GPIO: initializing using pin #${pinNr}`)

	let pinState = false

	const updatePinState = async () => {
		gpio && await gpio.write(pinNr, pinState)
		DEBUG && console.log(`GPIO: pin #${pinNr} set to ${pinState}`)
	}

	gpio && await gpio.setup(pinNr, gpio.DIR_OUT)
	await updatePinState()

	return makeThing({
		type: 'switch',
		id,
		label,
		hidden,
		publishChange
	})({
		state: {
			get: () => pinState,
			set: async newState => {
				if (pinState === Boolean(newState)) { return false }
				pinState = Boolean(newState)
				await updatePinState()
				return true
			}
		}
	})
}
