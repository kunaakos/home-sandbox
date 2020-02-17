/**
 * Serial Gateway
 * Reads incoming sensor data (in JSON) from the serial port,
 * creates a separate thing for each sensor id found.
 */
import fs from 'fs'
import SerialPort from 'serialport'
import Readline from '@serialport/parser-readline'

import { makeAmbientSensor } from '../things/ambient-sensor'

const DEBUG = true

const thingIdFrom = sensorId => `SERIAL__${sensorId}`

export const makeSerialGateway = ({
	description,
	config,
	things,
	publishChange
}) => {

	DEBUG && console.log('SERIAL: initializing')

	const onDataReceived = data => {
		try {
			const reading = JSON.parse(data)
			const { id: sensorId, t: temperature } = reading
			if (!sensorId || !temperature) { DEBUG && console.log('SERIAL: invalid data received') }
			const thingId = thingIdFrom(sensorId)

			if (things.has(thingId)) {
				things.set(thingId, { temperature })
				DEBUG && console.log(`SERIAL: Received data for ambient sensor with id ${thingId}`)
			} else {

				const ambientSensor = makeAmbientSensor({
					description: {
						id: thingId,
						label: `Sensor with ID "${sensorId}" reporting via serial.`,
						hidden: true,
						publishChange,
					},
					initialState: {
						temperature
					},
					publishChange
				})
				things.add(ambientSensor)

				DEBUG && console.log(`SERIAL: added ambient sensor with id ${thingId}`)
			}

		} catch (error) {
			console.error(error)
		}
	}

	const { path } = config

	if (path && fs.existsSync(path)) {
		const port = new SerialPort(path, { baudRate: 9600 })
		const parser = new Readline()
		port.pipe(parser)
		parser.on('data', onDataReceived)
	} else {
		DEBUG && console.log('SERIAL: device not found, continuing in mock mode')
	}

	return {
		type: 'serial-gateway',
		id: description.id
	}
}
