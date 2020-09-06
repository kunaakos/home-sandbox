/**
 * Xiaomi Mi Bluetooth Gateway
 * Reads Xiaomi Mi BLE sensor data.
 */

import { logger } from '../../../logger'
import { makeAmbientSensor } from '../../things/ambient-sensor'
import { makeMiBleScanner } from './mi-ble-scanner'

import pick from 'lodash/pick'
import difference from 'lodash/difference'

const MI_BLE_SENSOR_PROPERTIES = {
	temperature: {
		propertyName: 'temperature',
		type: 'number',
		skipEqualityCheck: true,
	},
	humidity: {
		propertyName: 'humidity',
		type: 'number',
		skipEqualityCheck: true,
	},
	moisture: {
		propertyName: 'moisture',
		type: 'number',
		skipEqualityCheck: false,
	},
	illuminance: {
		propertyName: 'illuminance',
		type: 'number',
		skipEqualityCheck: false,
	},
	battery: {
		propertyName: 'battery',
		type: 'number',
		skipEqualityCheck: false,
	},
	fertility: {
		propertyName: 'fertility',
		type: 'number',
		skipEqualityCheck: false,
	}
}

const getMiBleProperties = properties => Object.values(pick(MI_BLE_SENSOR_PROPERTIES, properties))

const thingIdFrom = address => `MI_BLE__${address.replace(/[:]/gi,'')}`

export const makeMiBleGateway = ({
	description,
	config,
	things
}) => {

	logger.info(`initializing MI BLE gateway #${description.id}`)

	const onSensorReport = ({
		name,
		address,
		values: newValues = {}
	}) => {
		try {
			if (!address || !name) {
				logger.trace('MI BLE gateway received incomplete report.')
				return
			}

			const thingId = thingIdFrom(address)
			const device = config.devices.find(device => device.address === address)

			if (!device) { return }

			const newProperties = Object.keys(newValues)

			// add sensor as thing if first seen and configured
			if (!things.has(thingId)) {
				logger.debug(`MI BLE gateway #${description.id} initializing new sensor #${thingId}`)
				things.add(makeAmbientSensor({
					description: {
						id: thingId,
						label: device.label,
						hidden: false,
					},
					properties: getMiBleProperties(newProperties),
					initialState: newValues
				}))
				return
			}

			const currentValues  = things.get(thingId)
			const currentProperties  = Object.keys(currentValues)
			const firstReportedProperties = difference(newProperties, currentProperties)

			// re-add sensor as thing if new properties were reported
			if (firstReportedProperties.length) {
				logger.debug(`MI BLE gateway #${description.id} re-initializing sensor #${thingId}`)
				const allValues = {
					...currentValues,
					...newValues
				}
				const allProperties = Object.keys(allValues)

				things.add(makeAmbientSensor({
					description: {
						id: thingId,
						label: device.label,
						hidden: false,
					},
					properties: getMiBleProperties(allProperties),
					initialState: allValues
				}))
				return
			}

			// update existing properties of sensor thing
			things.set(thingIdFrom(address), newValues)
		} catch (error) {
			logger.error(error, `error updating things with values received by #${description.id} from sensor '${name}'`)
		}
	}

	const scanner = makeMiBleScanner({
		devices: config.devices,
		onSensorReport,
		logger
	})

	scanner.start()

	return {
		type: 'mi-ble-gateway',
		id: description.id
	}
}
