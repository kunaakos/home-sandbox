import { preciseRound } from '../utils'

import { makeWatchdog } from '../watchdog'
import { makeThing } from '../thing'

const THIRTY_SECONDS = 1000 * 30
const TWO_MINUTES = 1000 * 60 * 2

export const makeThermostat = ({
	logger,
	description,
	config = {},
	initialState = {},
	publishChange
}) => {

	logger.debug(`initializing thermostat #${description.id}`)

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
			logger.warn(`thermostat #${description.id} timed out, turning heat 'OFF'`)
			state.heatRequest = false
			publishChange(description.id)(['heatRequest', 'timedOut'])
		},
		interval: watchdogTimeout
	})

	// return value is true if a state change occured, false otherwise
	const updateHeatRequest = () => {

		if (watchdog.timedOut()) {
			return false
		}

		if (
			state.heatRequest === false &&
			state.currentTemperature < state.targetTemperature - underrun
		) {
			logger.debug(`thermostat #${description.id} turning heat 'ON'`)
			state.heatRequest = true
			return true
		}

		if (
			state.heatRequest === true &&
			state.currentTemperature > state.targetTemperature + overrun
		) {
			logger.debug(`thermostat #${description.id} turning heat 'OFF'`)
			state.heatRequest = false
			return true
		}

		return false

	}

	setInterval(updateHeatRequest, tickInterval)

	return makeThing({
		logger,
		type: 'thermostat',
		description,
		publishChange,
		mutators: {
			targetTemperature: {
				type: 'number',
				get: () => state.targetTemperature,
				set: async newTargetTemperature => {
					state.targetTemperature = preciseRound(newTargetTemperature, 1)
					logger.trace(`thermostat #${description.id} target temperature set to '${state.targetTemperature}'`)
					return updateHeatRequest()
						? ['heatRequest', 'targetTemperature']
						: true
				}
			},
			currentTemperature: {
				type: 'number',
				skipEqualityCheck: true,
				get: () => state.currentTemperature,
				set: async newCurrentTemperature => {
					watchdog.pet()
					state.currentTemperature = preciseRound(newCurrentTemperature, 1)
					logger.trace(`thermostat #${description.id} current temperature set to '${state.currentTemperature}'`)
					return updateHeatRequest()
						? ['heatRequest', 'currentTemperature']
						: true
				}
			},
			heatRequest: {
				type: 'boolean',
				get: () => state.heatRequest,
			},
			timedOut: {
				type: 'boolean',
				get: () => watchdog.timedOut()
			}
		}
	})
}
