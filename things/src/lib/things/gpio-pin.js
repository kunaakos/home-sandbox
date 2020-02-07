import { makeThingTools } from '../thing-tools'

const gpio = process.env.REAL_GPIO
	? require('rpi-gpio').promise
	: null

const DEBUG = true

export const makeGpioPin = async ({
	id,
	label,
	hidden,
	pinNr,
}) => {

	DEBUG && console.log(`GPIO: initializing using pin #${pinNr}`)

	const { makeThing , stateChanged } = makeThingTools({
		type: 'switch',
		id,
		label,
		hidden
	})

	let pinState = false

	const updatePinState = async () => {
		gpio && await gpio.write(pinNr, pinState)
		DEBUG && console.log(`GPIO: pin #${pinNr} set to ${pinState}`)
	}

	gpio && await gpio.setup(pinNr, gpio.DIR_OUT)
	await updatePinState()

	return makeThing({
		state: {
			get: () => pinState,
			set: async newState => {
				pinState = Boolean(newState)
				await updatePinState()
				stateChanged(['state'])
			}
		}
	})
}
