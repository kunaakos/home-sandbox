/**
 * Serial Gateway
 * Reads incoming sensor data (in JSON) from the serial port, emits messsages
 */

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

const DEBUG = true

export const SerialGateway = ({
  events,
  errorHandler,
  path,
  idMap = {}
}) => {

  DEBUG && console.log('Serial: initializing')

  const onDataReceived = (data) => {
    DEBUG && console.log('Serial: data received')

    try {
      const reading = JSON.parse(data)

      // max packet size is 32bytes, text ids won't fit, using numeric ids instead
      const sensorId = `SERIAL__${idMap[reading.id] || 'UNKOWN_SENSOR_ID'}`

      events.emit('message', {
        type: 'sensorreading',
        sourceId: `${sensorId}`,
        payload: reading
      })

    } catch (error) {
      errorHandler && errorHandler(error)
    }
  }

  if (path) {
    const port = new SerialPort(path, { baudRate: 9600 })
    const parser = new Readline()
    port.pipe(parser)
    parser.on('data', onDataReceived)
    return { type: 'serial-gateway' }
  } else {
    DEBUG && console.log('Serial: device not found, continuing in mock mode')
    return { type: 'serial-gateway' }
  }
}
