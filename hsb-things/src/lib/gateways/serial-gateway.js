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

const thingIdFrom = sensorId => `SERIAL__${sensorId}`

export const makeSerialGateway = ({
	description,
	config,
	things
}) => {

	logger.info(`initializing serial gateway #${description.id}`)

	const onDataReceived = data => {
		try {
			const reading = JSON.parse(data)
			const { id: sensorId, t: temperature } = reading
			if (!sensorId || !temperature) {
				logger.warn(`serial gateway #${description.id} received invalid data`)
				return
			}
			const thingId = thingIdFrom(sensorId)

			if (things.has(thingId)) {
				logger.trace(`serial gateway #${description.id} received data for #${thingId}`)
				things.set(thingId, { temperature })
			} else {
				logger.debug(`serial gateway #${description.id} initializing new sensor #${thingId}`)

				const ambientSensor = makeAmbientSensor({
					description: {
						id: thingId,
						label: `Sensor with ID "${sensorId}" reporting via serial.`,
						hidden: true
					},
					initialState: {
						temperature
					}
				})
				things.add(ambientSensor)
			}

		} catch (error) {
			logger.error(error, `error processing data received by #${description.id}`)
		}
	}

	const { path } = config

	if (path && fs.existsSync(path)) {
		const port = new SerialPort(path, { baudRate: 9600 })
		const parser = new Readline()
		port.pipe(parser)
		parser.on('data', onDataReceived)
		logger.info(`serial gateway #${description.id} listening on port '${path}'`)
	} else {
		logger.warn(`port configured for serial gateway #${description.id} is not accessible, continuing in mock mode`)
	}

	return {
		type: 'serial-gateway',
		id: description.id
	}
}
