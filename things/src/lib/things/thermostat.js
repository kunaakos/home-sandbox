import { makeWatchdog } from '../watchdog'
import { makeThing } from '../thing'

const THIRTY_SECONDS = 1000 * 30
const TWO_MINUTES = 1000 * 60 * 2

const DEBUG = process.env.DEBUG

export const makeThermostat = ({
	description,
	config = {},
	initialState = {},
	publishChange
}) => {

	DEBUG && console.log(`THERMOSTAT: initializing ${description.id}`)

	let {
		overrun = 0.1,
		underrun = 0.2,
		watchdogTimeout = TWO_MINUTES,
		tickInterval = THIRTY_SECONDS
	} = config

	const state = {
		heatRequest: false,
		targetTemperature: 0,
		currentTemperature: 0,
		...initialState
	}

	const watchdog = makeWatchdog({
		onTimedOut: () => {
			DEBUG && console.log(`THERMOSTAT: timed out, turning off heat`)
			setHeatRequest(false)
		},
		interval: watchdogTimeout
	})

	const setHeatRequest = newHeatRequestState => {
		state.heatRequest = newHeatRequestState
		publishChange(description.id)(['heatRequest'])
	}

	const updateHeatRequest = () => {

		if (watchdog.timedOut()) {
			return
		}

		if (
			state.heatRequest === false &&
			state.currentTemperature < state.targetTemperature - underrun
		) {
			DEBUG && console.log(`THERMOSTAT: turning heating ON`)
			setHeatRequest(true)
			return
		}

		if (
			state.heatRequest === true &&
			state.currentTemperature > state.targetTemperature + overrun
		) {
			DEBUG && console.log(`THERMOSTAT: turning heating OFF`)
			setHeatRequest(false)
			return
		}

	}

	const tickIntervalHandle = setInterval(updateHeatRequest, tickInterval)

	return makeThing({
		type: 'thermostat',
		description,
		publishChange,
		mutators: {
			targetTemperature: {
				type: 'number',
				get: () => state.targetTemperature,
				set: async newTargetTemperature => {
					state.targetTemperature = newTargetTemperature
					DEBUG && console.log(`THERMOSTAT: target temperature set to ${state.targetTemperature}`)
					updateHeatRequest()
					return true
				}
			},
			currentTemperature: {
				type: 'number',
				skipEqualityCheck: true,
				get: () => state.currentTemperature,
				set: async newCurrentTemperature => {
					watchdog.pet()
					state.currentTemperature = newCurrentTemperature
					DEBUG && console.log(`THERMOSTAT: current temperature updated to ${state.currentTemperature}`)
					updateHeatRequest()
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
