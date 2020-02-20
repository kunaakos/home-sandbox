import { makeThing } from '../thing'

const THIRTY_SECONDS = 1000 * 30
const TWO_MINUTES = 1000 * 60 * 2

const DEBUG = process.env.DEBUG

export const makeThermostat = ({
	description,
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

	const state = {
		heatRequest: false,
		lastCurrentTemperatureUpdate: 0,
		timedOut: true
	}

	const setHeatRequest = newHeatRequestState => {
		state.heatRequest = newHeatRequestState
		publishChange(description.id)(['heatRequest'])
	}

	const tick = () => {

		// TODO: implement watchdog timer utility
		if (state.timedOut) {
			return
		} else if (Date.now() - state.lastCurrentTemperatureUpdate > watchdogTimeout) {
			DEBUG && console.log(`THERMOSTAT: timed out, turning off heat`)
			state.timedOut = true
			setHeatRequest(false)
			return
		}

		// turn ON if temperature drops below target - threshold
		if (
			state.heatRequest === false &&
			currentTemperature < targetTemperature - underrun
		) {
			DEBUG && console.log(`THERMOSTAT: turning heating ON`)
			setHeatRequest(true)
			return
		}

		// turn OFF if temperature reached target
		if (
			state.heatRequest === true &&
			currentTemperature > targetTemperature + overrun
		) {
			DEBUG && console.log(`THERMOSTAT: turning heating OFF`)
			setHeatRequest(false)
			return
		}

	}

	const tickIntervalHandle = setInterval(() => tick(), tickInterval)

	return makeThing({
		type: 'thermostat',
		description,
		publishChange,
		mutators: {
			targetTemperature: {
				type: 'number',
				get: () => targetTemperature,
				set: async newTargetTemperature => {
					targetTemperature = newTargetTemperature
					DEBUG && console.log(`THERMOSTAT: target temperature set to ${targetTemperature}`)
					tick()
					return true
				}
			},
			currentTemperature: {
				type: 'number',
				skipEqualityCheck: true,
				get: () => currentTemperature,
				set: async newCurrentTemperature => {
					state.lastCurrentTemperatureUpdate = Date.now()
					state.timedOut = false
					currentTemperature = newCurrentTemperature
					DEBUG && console.log(`THERMOSTAT: current temperature updated to ${currentTemperature}`)
					tick()
					return true
				}
			},
			heatRequest: {
				type: 'boolean',
				get: () => state.heatRequest,
			}
		}
	})
}
