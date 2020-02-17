import { makeThing } from '../thing'

const THIRTY_SECONDS = 1000 * 30
const TWO_MINUTES = 1000 * 60 * 2

const DEBUG = true

export const makeThermostat = async ({
	description,
	// config,
	initialState,
	publishChange
}) => {

	DEBUG && console.log(`THERMOSTAT: initializing ${description.id}`)

	let {
		targetTemperature = 0,
		currentTemperature = 0,
		overrun = 0.1,
		underrun = 0.2,
		watchdogTimeout = TWO_MINUTES,
		tickInterval = THIRTY_SECONDS
	} = initialState

	let heatRequest = false
	let lastCurrentTemperatureUpdate

	const setHeatRequest = async newState => {
		heatRequest = newState
		publishChange(description.id)(['heatRequest'])
	}

	const tick = async () => {

		// shut down if not updated in a long time
		// TODO: implement watchdog timer utility
		if (
			heatRequest === true &&
			Date.now() - lastCurrentTemperatureUpdate > watchdogTimeout
		) {
			DEBUG && console.log(`THERMOSTAT: temperatures not updated, turning off heating`)
			setHeatRequest(false)
			return
		}

		// turn ON if temperature drops below target - threshold
		if (
			heatRequest === false &&
			currentTemperature < targetTemperature - underrun
		) {
			DEBUG && console.log(`THERMOSTAT: turning heating ON`)
			setHeatRequest(true)
			return
		}

		// turn OFF if temperature reached target
		if (
			heatRequest === true &&
			currentTemperature > targetTemperature + overrun
		) {
			DEBUG && console.log(`THERMOSTAT: turning heating OFF`)
			setHeatRequest(false)
			return
		}

	}

	const tickIntervalHandle = setInterval(() => tick().catch(error => console.error(error)), tickInterval)
	
	// TODO: see if setters return before or after a tick is finished - tick could change heatRequest state
	return makeThing({
		type: 'thermostat',
		description,
		publishChange
	})({
		targetTemperature: {
			get: () => targetTemperature,
			set: async newTargetTemperature => {
				if (newTargetTemperature === targetTemperature) { return false } 
				targetTemperature = newTargetTemperature
				DEBUG && console.log(`THERMOSTAT: target temperature set to ${targetTemperature}`)
				tick() // <- here
				return true
			}
		},
		currentTemperature: {
			get: () => currentTemperature,
			set: async newCurrentTemperature => {
				if (newCurrentTemperature === currentTemperature) { return false } 
				currentTemperature = newCurrentTemperature
				DEBUG && console.log(`THERMOSTAT: current temperature updated to ${currentTemperature}`)
				tick() // <- and here
				return true
			}
		},
		heatRequest: {
			get: ()  => heatRequest,
			set: async () => false // read-only
		}
	})
}
