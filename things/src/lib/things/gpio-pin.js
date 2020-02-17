import { makeThing } from '../thing'

const gpio = process.env.REAL_GPIO
	? require('rpi-gpio').promise
	: null

const DEBUG = true

export const makeGpioPin = async ({
	description,
	config,
	initialState,
	publishChange
}) => {

	DEBUG && console.log(`GPIO: initializing using pin #${config.pinNr}`)

	let { pinState = false } = initialState

	const updatePinState = async () => {
		gpio && await gpio.write(config.pinNr, pinState)
		DEBUG && console.log(`GPIO: pin #${config.pinNr} set to ${pinState}`)
	}

	gpio && await gpio.setup(config.pinNr, gpio.DIR_OUT)
	await updatePinState()

	return makeThing({
		type: 'switch',
		description,
		publishChange,
		mutators: {
			state: {
				get: () => pinState,
				set: async newState => {
					if (pinState === Boolean(newState)) { return false }
					pinState = Boolean(newState)
					await updatePinState()
					return true
				}
			}
		}
	})
}
