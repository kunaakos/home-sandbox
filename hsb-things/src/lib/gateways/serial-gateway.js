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

export const makeSerialGateway = async ({
	id,
	config: {
		path,
		hideSensors = true
	},
	things
}) => {

	logger.info(`initializing serial gateway #${id}`)

	const thingIds = new Map()

	const onDataReceived = async data => {
		try {
			const reading = JSON.parse(data)
			const { id: sensorId, t: temperature } = reading
			if (!sensorId || !temperature) {
				logger.warn(`serial gateway #${id} received invalid data`)
				return
			}
			const fingerprint = fingerprintFrom(sensorId)

			if (thingIds.has(fingerprint)) {
				logger.trace(`serial gateway #${id} received data for #${fingerprint}`)
				things.set(thingIds.get(fingerprint), { temperature })
			} else {
				logger.debug(`serial gateway #${id} initializing new sensor #${fingerprint}`)

				const ambientSensor = makeAmbientSensor({
					fingerprint,
					gatewayId: id,
					label: `Sensor with ID "${sensorId}" reporting via serial`,
					isHidden: hideSensors,
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
			logger.error(error, `error processing data received by #${id}`)
		}
	}

	if (path && fs.existsSync(path)) {
		const port = new SerialPort(path, { baudRate: 9600 })
		const parser = new Readline()
		port.pipe(parser)
		parser.on('data', onDataReceived)
		logger.info(`serial gateway #${id} listening on port '${path}'`)
	} else {
		logger.warn(`port configured for serial gateway #${id} is not accessible, continuing in mock mode`)
	}

}
