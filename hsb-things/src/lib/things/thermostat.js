import { preciseRound } from '../utils'

import { makeWatchdog } from '../watchdog'
import { makeThing } from '../thing'

import { logger } from '../../logger'

const THIRTY_SECONDS = 1000 * 30
const TWO_MINUTES = 1000 * 60 * 2

export const makeThermostat = ({
	fingerprint,
	gatewayId,
	label,
	isHidden,
	overrun = 0.1,
	underrun = 0.2,
	watchdogTimeout = TWO_MINUTES,
	publishChange
}) => {

	logger.debug(`initializing thermostat #${fingerprint}`)

	const state = {
		heatRequest: false,
		targetTemperature: 0,
		currentTemperature: 0,
	}

	const watchdog = makeWatchdog({
		onTimedOut: () => {
			logger.warn(`thermostat #${fingerprint} timed out, turning heat 'OFF'`)
			state.heatRequest = false
			publishChange(['heatRequest', 'timedOut'])
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
			logger.debug(`thermostat #${fingerprint} turning heat 'ON'`)
			state.heatRequest = true
			return true
		}

		if (
			state.heatRequest === true &&
			state.currentTemperature > state.targetTemperature + overrun
		) {
			logger.debug(`thermostat #${fingerprint} turning heat 'OFF'`)
			state.heatRequest = false
			return true
		}

		return false

	}

	return makeThing({
		type: 'thermostat',
		fingerprint,
		gatewayId,
		label,
		isHidden,
		mutators: {
			targetTemperature: {
				type: 'number',
				get: () => state.targetTemperature,
				set: async newTargetTemperature => {
					state.targetTemperature = preciseRound(newTargetTemperature, 1)
					logger.trace(`thermostat #${fingerprint} target temperature set to '${state.targetTemperature}'`)
					return updateHeatRequest()
						? ['heatRequest', 'targetTemperature']
						: ['targetTemperature']
				}
			},
			currentTemperature: {
				type: 'number',
				skipEqualityCheck: true,
				get: () => state.currentTemperature,
				set: async newCurrentTemperature => {
					watchdog.pet()
					state.currentTemperature = preciseRound(newCurrentTemperature, 1)
					logger.trace(`thermostat #${fingerprint} current temperature set to '${state.currentTemperature}'`)
					return updateHeatRequest()
						? ['heatRequest', 'currentTemperature']
						: ['currentTemperature']
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
