const THIRTY_SECONDS = 1000 * 30
const TWO_MINUTES = 1000 * 60 * 2

const DEBUG = true

export const Thermostat = async ({
    id,
    label,
    heatSwitchId,
    currentTemperature: initialCurrentTemperature = 0,
    targetTemperature: initialTargetTemperature = 0,
    overrun = 0.1,
    underrun = 0.2,
    watchdogTimeout = TWO_MINUTES,
    errorHandler,
    things,
    events
}) => {

    DEBUG && console.log('THERMOSTAT: initializing')

    let targetTemperature = initialTargetTemperature
    let currentTemperature = initialCurrentTemperature
    let lastCurrentTemperatureUpdate

    const setHeatSwitchState = async newState => {
        const heatSwitch = things.get(heatSwitchId)
        if (!heatSwitch) { throw new Error('Thermostat can\'t access heat switch.') }

        return newState
            ? await heatSwitch.on()
            : await heatSwitch.off()
    }

    const getHeatSwitchState = async () => {
        const heatSwitch = things.get(heatSwitchId)
        if (!heatSwitch) { throw new Error('Thermostat can\'t access heat switch.') }
        return heatSwitch.getState()
    }

    const setTargetTemperature = async value => {
        if (isNaN(value)) {
            throw new Error('Invalid target temperature value.')
        }
        targetTemperature = value.toFixed(1)
        await tick()
        DEBUG && console.log(`THERMOSTAT: target temperature set to ${value}`)
        return targetTemperature
    }

    const setCurrentTemperature = async value => {
        currentTemperature = value.toFixed(1)
        lastCurrentTemperatureUpdate = Date.now()
        await tick()
        DEBUG && console.log(`THERMOSTAT: current temperature updated to ${currentTemperature}`)
    }

    const processMessage = reading => {
        if (reading && reading.payload && reading.payload.t && !isNaN(reading.payload.t)) {
            setCurrentTemperature(reading.payload.t)
        }
    }

    const tick = async () => {

        const heatState = await getHeatSwitchState()

        // temp hack: log heat relay state to adafruit io
        events.emit('message', {
            type: 'sensorreading',
            sourceId: id,
            payload: { t: heatState ? 1 : 0 }
        })

        // shut down if not updated in a long time
        if (
            heatState === true &&
            Date.now() - lastCurrentTemperatureUpdate > watchdogTimeout
        ) {
            DEBUG && console.log(`THERMOSTAT: temperatures not updated, turning off heating`)
            return setHeatSwitchState(false)
        }

        // turn ON if temperature drops below target - threshold
        if (
            heatState === false &&
            currentTemperature < targetTemperature - underrun
        ) {
            DEBUG && console.log(`THERMOSTAT: turning heating ON`)
            return setHeatSwitchState(true)
        }

        // turn OFF if temperature reached target
        if (
            heatState === true &&
            currentTemperature > targetTemperature + overrun
        ) {
            DEBUG && console.log(`THERMOSTAT: turning heating OFF`)
            return setHeatSwitchState(false)
        }

    }

    // TODO: proper start/stop/pause
    const stop = async () => {
        DEBUG && console.log(`THERMOSTAT: stopping`)
        tickIntervalHandle && clearInterval(tickIntervalHandle)
        return setHeatSwitchState(false)
    }

    const tickIntervalHandle = setInterval(() => tick().catch(errorHandler), THIRTY_SECONDS)

    return {
        type: 'thermostat',
        id,
        label,
        processMessage,
        getTargetTemperature: () => targetTemperature,
        setTargetTemperature,
        getCurrentTemperature: () => currentTemperature,
        stop
    }

}
