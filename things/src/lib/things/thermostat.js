import { makeThingTools } from '../thing-tools'

const THIRTY_SECONDS = 1000 * 30
const TWO_MINUTES = 1000 * 60 * 2

const DEBUG = true

export const makeThermostat = async ({
	id,
	label,
	initialValues = {}
}) => {

	DEBUG && console.log(`THERMOSTAT: initializing ${id}`)

	const { makeThing, stateChanged } = makeThingTools({
		type: 'thermostat',
		id,
		label
	})

	let {
		targetTemperature = 0,
		currentTemperature = 0,
		overrun = 0.1,
		underrun = 0.2,
		watchdogTimeout = TWO_MINUTES,
		tickInterval = THIRTY_SECONDS
	} = initialValues

	let heatRequest = false
	let lastCurrentTemperatureUpdate

	const setHeatRequest = async newState => {
		heatRequest = newState
		stateChanged(['heatRequest'])
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
		targetTemperature: {
			get: () => targetTemperature,
			set: async newTargetTemperature => {
				targetTemperature = newTargetTemperature
				DEBUG && console.log(`THERMOSTAT: target temperature set to ${targetTemperature}`)
				tick() // <- here
			}
		},
		currentTemperature: {
			get: () => currentTemperature,
			set: async newCurrentTemperature => {
				currentTemperature = newCurrentTemperature
				DEBUG && console.log(`THERMOSTAT: current temperature updated to ${currentTemperature}`)
				tick() // <- and here
			}
		}
	})
}
