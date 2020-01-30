
/**
 * NRF24 Gateway
 * Handles radio hardware and communication for NRF24 sensors.
 * It does not register any things, it only emits 'reading' messages.
 */

const nrf24 = process.env.REAL_NRF24
    ? require('nrf24')
    : null

const DEBUG = true
const DEBUG_HARDWARE = false
const DEFAULT_RADIO_CONFIG = nrf24
  ? {
    PALevel: nrf24.RF24_PA_HIGH,
    DataRate: nrf24.RF24_250KBPS,
    CRCLength: nrf24.RF24_CRC_16,
    PayloadSize: 32,
    AutoAck: true
  }
  : null

export const Nrf24Gateway = ({
  events,
  errorHandler,
  radioConfig = DEFAULT_RADIO_CONFIG,
  readAddress,
  cePin = 25,
  csPin = 0,
  idMap = {}
}) => {

  DEBUG && console.log('NRF24: initializing')

  const onStopped = (isStopped, by_user, error_count) => {
    DEBUG && console.log('NRF24: radio stopped')
  }

  const onDataReceived = (data) => {
    DEBUG && console.log('NRF24: packet received')

    let jsonString
    try {
      // TODO: fix this mess
      jsonString = data[0].data.toString('utf8').replace(/\0/g, '')
      const hotfixedJsonString = jsonString.match(/(\{[^}]*\})(.*})?/)[1]
      const sensorReading = JSON.parse(hotfixedJsonString)

      // max packet size is 32bytes, text ids won't fit, using numeric ids instead
      const sensorId = `NRF24__${idMap[sensorReading.id] || 'UNKOWN_SENSOR_ID'}`

      events.emit('message', {
        type: 'sensorreading',
        sourceId: `${sensorId}`,
        payload: sensorReading
      })

    } catch (error) {
      errorHandler && errorHandler(error)
    }
  }

  if (nrf24) {
    const radio = new nrf24.nRF24(cePin, csPin)
    radio.begin(DEBUG_HARDWARE)
  
    if (!radio.present()) {
      DEBUG && console.log('NRF24: radio hardware not repsonding, continuing in mock mode')
      errorHandler && errorHandler(new Error('NRF24 radio hardware not repsonding'))
      // continue in mock mode
      return {
        type: 'nrf24-gateway'
      }
    }
  
    radio.config(radioConfig, DEBUG_HARDWARE)
    radio.addReadPipe(readAddress, true)
    radio.read(onDataReceived, onStopped)
    DEBUG && console.log('NRF24: radio listening')
    // continue in real mode
    return {
      type: 'nrf24-gateway'
    }
  } else {
    DEBUG && console.log('NRF24: radio hardware not found, continuing in mock mode')
    // continue in mock mode
    return {
      type: 'nrf24-gateway'
    }
  }
}
