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

const fingerprintFrom = address => `MI_BLE__${address.replace(/[:]/gi, '')}`

export const makeMiBleGateway = ({
	description,
	config: {devices = []} = {},
	things
}) => {

	logger.info(`initializing MI BLE gateway #${description.id}`)

	const thingIds = new Map()

	const onSensorReport = async({
		name,
		address,
		values: newValues = {}
	}) => {
		try {
			if (!address || !name) {
				logger.trace('MI BLE gateway received incomplete report.')
				return
			}

			const device = devices.find(device => device.address === address)

			if (!device) { return }

			const fingerprint = fingerprintFrom(address)
			const newProperties = Object.keys(newValues)

			// add sensor as thing when first seen
			if (!thingIds.has(fingerprint)) {
				logger.debug(`MI BLE gateway #${description.id} initializing new sensor #${fingerprint}`)
				const ambientSensor = makeAmbientSensor({
					fingerprint,
					label: device.label,
					isHidden: false,
					properties: getMiBleProperties(newProperties),
					initialState: newValues
				})
				const thingId = things.add(
					ambientSensor,
					newProperties
				)
				thingIds.set(fingerprint, thingId)
				return
			}

			const currentValues = things.get(thingIds.get(fingerprint))
			const currentProperties = Object.keys(currentValues)
			const firstReportedProperties = difference(newProperties, currentProperties)

			// re-add sensor as thing if new properties were reported
			if (firstReportedProperties.length) {
				logger.debug(`MI BLE gateway #${description.id} re-initializing sensor #${fingerprint}`)
				const allValues = {
					...currentValues,
					...newValues
				}
				const allProperties = Object.keys(allValues)

				things.add(
					makeAmbientSensor({
						fingerprint: fingerprint,
						label: device.label,
						isHidden: false,
						properties: getMiBleProperties(allProperties),
						initialState: allValues
					}),
					newProperties
				)
				return
			}

			// update existing properties of sensor thing
			things.set(thingIds.get(fingerprint), newValues)
		} catch (error) {
			logger.error(error, `error updating things with values received by #${description.id} from sensor '${name}'`)
		}
	}

	const scanner = makeMiBleScanner({
		devices,
		onSensorReport,
		logger
	})

	scanner.start()

	return {
		type: 'mi-ble-gateway',
		id: description.id
	}
}
