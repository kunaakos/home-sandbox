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
    things
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
        currentTemperature = value
        lastCurrentTemperatureUpdate = Date.now()
        await tick()
        DEBUG && console.log(`THERMOSTAT: current temperature updated to ${value}`)
    }

    const processReading = reading => {
        if (reading && reading.payload && reading.payload.t) {
            setCurrentTemperature(reading.payload.t)
        }
    }
    
    const tick = async () => {

        const heatState = await getHeatSwitchState()
    
        // shut down if not updated in a long time
        if (Date.now() - lastCurrentTemperatureUpdate > watchdogTimeout) {
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
            return heatSwitch(false)
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
        processReading,
        getTargetTemperature: () => targetTemperature,
        setTargetTemperature,
        getCurrentTemperature: () => currentTemperature,
        stop
    }
    
}
