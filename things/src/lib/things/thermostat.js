import { Thing } from './thing'

const THIRTY_SECONDS = 1000 * 30
const TWO_MINUTES = 1000 * 60 * 2

const DEBUG = true

export const Thermostat = async ({
	id,
	label,
	heatSwitchId,
	overrun = 0.1,
	underrun = 0.2,
	watchdogTimeout = TWO_MINUTES,
	tickInterval = THIRTY_SECONDS,
	things
}) => {

	DEBUG && console.log('THERMOSTAT: initializing')

	let targetTemperature = 0
	let currentTemperature = 0
	let lastCurrentTemperatureUpdate

	const setHeatSwitchState = async newState => things.set(heatSwitchId, { state: newState })

	const getHeatSwitchState = async () => {
		const { state } = things.get(heatSwitchId)
		return state
	}

	const tick = async () => {

		const heatState = await getHeatSwitchState()

		// shut down if not updated in a long time
		if (
			heatState === true &&
			Date.now() - lastCurrentTemperatureUpdate > watchdogTimeout
		) {
			DEBUG && console.log(`THERMOSTAT: temperatures not updated, turning off heating`)
			return setHeatSwitchState(false)
		}

		// turn ON if temperature drops below target - threshold
		if (
			heatState === false &&
			currentTemperature < targetTemperature - underrun
		) {
			DEBUG && console.log(`THERMOSTAT: turning heating ON`)
			return setHeatSwitchState(true)
		}

		// turn OFF if temperature reached target
		if (
			heatState === true &&
			currentTemperature > targetTemperature + overrun
		) {
			DEBUG && console.log(`THERMOSTAT: turning heating OFF`)
			return setHeatSwitchState(false)
		}

	}

	const tickIntervalHandle = setInterval(() => tick().catch(error => console.error(error)), tickInterval)

	// TODO: see if setters return before or after a tick is finished - tick could change other things' state
	const values = {
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
	}

	return Thing({
		type: 'thermostat',
		id,
		label,
		values
	})

}
