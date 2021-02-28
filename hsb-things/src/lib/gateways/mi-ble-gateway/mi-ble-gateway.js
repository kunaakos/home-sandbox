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

export const makeMiBleGateway = async ({
	id,
	config: {
		devices = []
	} = {},
	things
}) => {

	logger.info(`initializing MI BLE gateway #${id}`)

	const fingerprints = new Set()
	const thingIds = {}

	const onSensorReport = async ({
		name,
		address,
		values: latestValues = {}
	}) => {
		try {
			if (!address || !name) {
				logger.trace('MI BLE gateway received incomplete report.')
				return
			}

			const device = devices.find(device => device.address === address)

			if (!device) { return }

			const fingerprint = fingerprintFrom(address)
			const latestProperties = Object.keys(latestValues)

			// add sensor as thing when first seen
			if (!fingerprints.has(fingerprint)) {
				
				fingerprints.add(fingerprint)
				logger.debug(`MI BLE gateway #${id} initializing new sensor #${fingerprint}`)
				
				const ambientSensor = makeAmbientSensor({
					fingerprint,
					gatewayId: id,
					label: device.label,
					isHidden: device.isHidden || false,
					properties: getMiBleProperties(latestProperties),
					initialState: latestValues
				})

				thingIds[fingerprint] = await things.add(
					ambientSensor,
					latestProperties
				)
				return
			}

			// avoid race condition bug when a new report from a new thing
			// is already being processed before the thing was properly added to the store
			// after the first report
			if (!thingIds[fingerprint]) { return }

			const currentValues = things.get(thingIds[fingerprint])
			const currentProperties = Object.keys(currentValues)
			const newProperties = difference(latestProperties, currentProperties)

			// re-add sensor as thing if new properties were reported
			if (newProperties.length) {
				logger.debug(`MI BLE gateway #${id} re-initializing sensor #${fingerprint}`)
				const allValues = {
					...currentValues,
					...latestValues
				}
				const allProperties = Object.keys(allValues)

				await things.add(
					makeAmbientSensor({
						fingerprint: fingerprint,
						gatewayId: id,
						label: device.label,
						isHidden: device.isHidden || false,
						properties: getMiBleProperties(allProperties),
						initialState: allValues
					}),
					latestProperties
				)
				return
			}

			// update existing properties of sensor thing
			things.set(thingIds[fingerprint], latestValues)
		} catch (error) {
			logger.error(error, `error updating things with values received by #${id} from sensor '${name}'`)
		}
	}

	const scanner = makeMiBleScanner({
		devices,
		onSensorReport,
		logger
	})

	scanner.start()

}
