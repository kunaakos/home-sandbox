const gpio = process.env.REAL_GPIO
    ? require('rpi-gpio').promise
    : null

const DEBUG = true

export const Relay = async ({
    id,
    label,
    hidden,
    pinNr,
    onStateChanged
}) => {

    let pinState = false
    DEBUG && console.log(`RELAY: initializing using pin #${pinNr}`)

    const updatePinState = async () => {
        gpio &&  await gpio.write(pinNr, pinState)
        DEBUG && console.log(`RELAY: pin #${pinNr} set to ${pinState}`)
        onStateChanged && onStateChanged(pinState)
    }

    const on = async () => {
        pinState = true
        await updatePinState()
    }

    const off = async () => {
        pinState = false
        await updatePinState()
    }

    const getState = async () => pinState

    gpio && await gpio.setup(pinNr, gpio.DIR_OUT)
    await updatePinState()

    return {
        type: 'switch',
        id,
        label,
        hidden,
        on,
        off,
        getState
    }
}
