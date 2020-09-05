/**
 * Xiaomi Mi Bluetooth Gateway
 * Reads Xiaomi Mi BLE sensor data.
 */

import { logger } from '../../../logger'

import { makeAmbientSensor } from '../../things/ambient-sensor'

import { makeMiBleScanner } from './mi-ble-scanner'

const MI_BLE_SENSOR_PROPERTIES = [
	{
		propertyName: 'temperature',
		type: 'number',
		skipEqualityCheck: true,
	},
	{
		propertyName: 'humidity',
		type: 'number',
		skipEqualityCheck: true,
	},
	{
		propertyName: 'moisture',
		type: 'number',
		skipEqualityCheck: false,
	},
	{
		propertyName: 'illuminance',
		type: 'number',
		skipEqualityCheck: false,
	},
	{
		propertyName: 'battery',
		type: 'number',
		skipEqualityCheck: false,
	},
	{
		propertyName: 'fertility',
		type: 'number',
		skipEqualityCheck: false,
	},
	
]

const thingIdFrom = address => `MI_BLE__${address.toUpperCase()}`

export const makeMiBleGateway = ({
	description,
	config,
	things
}) => {

	logger.info(`initializing MI BLE gateway #${description.id}`)

	config.devices.forEach(device => {

		logger.debug(`MI BLE gateway #${description.id} initializing new sensor #${thingIdFrom(device.address)}`)

		const ambientSensor = makeAmbientSensor({
			description: {
				id: thingIdFrom(device.address),
				label: device.label,
				hidden: false,
			},
			properties: MI_BLE_SENSOR_PROPERTIES,
			initialState: {
				temperature: 0,
				humidity: 0,
				moisture: 0,
				illuminance: 0,
				battery: 0,
				fertility: 0
			}
		})
		things.add(ambientSensor)
	})

	const onSensorStateChange = ({
		name,
		address,
		values
	}) => {
		try {
			things.set(thingIdFrom(address), values)
		} catch (error) {
			logger.error(error, `error updating things with values received by #${description.id} from sensor '${name}'`)
		}
	}

	const scanner = makeMiBleScanner({
		devices: config.devices,
		onSensorStateChange,
		logger
	})

	scanner.start()

	return {
		type: 'mi-ble-gateway',
		id: description.id
	}
}
