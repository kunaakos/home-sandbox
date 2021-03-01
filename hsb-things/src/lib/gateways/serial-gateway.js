/**
 * Serial Gateway
 * Reads incoming sensor data (in JSON) from the serial port,
 * creates a separate thing for each sensor id found.
 */
import fs from 'fs'
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

import { logger } from '../../logger'

import { makeAmbientSensor } from '../things/ambient-sensor'

const fingerprintFrom = sensorId => `SERIAL__${sensorId}`

const getDeviceConfig = (id, deviceConfigs) => deviceConfigs.find(deviceConfig => deviceConfig.id === id)

const parseSensorData = data => {
	const reading = JSON.parse(data)
	const { id, t } = reading
	return {
		id: `${id}`,
		temperature: t
	}
}

export const makeSerialGateway = async ({
	id: gatewayId,
	config: {
		path,
		devices: deviceConfigs = []
	},
	things
}) => {

	logger.info(`initializing serial gateway #${gatewayId}`)

	// ids of things added by this gateway
	const thingIds = new Map()

	const onDataReceived = async data => {
		try {
			const { id: serialDeviceId , temperature } = parseSensorData(data)
			if (!serialDeviceId || !temperature) {
				logger.info(`serial gateway #${gatewayId} received invalid data`)
				return
			}

			const fingerprint = fingerprintFrom(serialDeviceId)

			if (thingIds.has(fingerprint)) {
				// this device is configured and already added as a thing
				logger.trace(`serial gateway #${gatewayId} received data for #${fingerprint}`)
				things.set(thingIds.get(fingerprint), { temperature })
			} else {
				// this device is not yet added, check if it was configured...
				const { label, isHidden = true } = getDeviceConfig(serialDeviceId, deviceConfigs) || {}
				if (!label) { return }

				// and add it as a thing if it was
				logger.debug(`serial gateway #${gatewayId} initializing new sensor #${fingerprint}`)
				const ambientSensor = makeAmbientSensor({
					fingerprint,
					gatewayId,
					label,
					isHidden,
					properties: [
						{
							propertyName: 'temperature',
							type: 'number',
							skipEqualityCheck: true,
						},
					],
					initialState: {
						temperature
					}
				})

				const thingId = await things.add(ambientSensor)
				thingIds.set(fingerprint, thingId)
			}

		} catch (error) {
			logger.error(error, `error processing data received by #${gatewayId}`)
		}
	}

	if (path && fs.existsSync(path)) {
		const port = new SerialPort(path, { baudRate: 9600 })
		const parser = new Readline()
		port.pipe(parser)
		parser.on('data', onDataReceived)
		logger.info(`serial gateway #${gatewayId} listening on port '${path}'`)
	} else {
		logger.warn(`port configured for serial gateway #${gatewayId} is not accessible, continuing in mock mode`)
	}

}
