import { makeThing } from '../thing'

const DEBUG = true

export const makeLight = ({
	description,
	effects,
	initialState,
	publishChange
}) => {

	DEBUG && console.log(`LIGHT: initializing ${description.id}`)

	let {
        isOn = false,
        brightness = 100
    } = initialState

	return makeThing({
		type: 'light',
		description,
		publishChange,
		mutators: {
			isOn: {
				get: () => isOn,
				set: async newState => {
					if (isOn === Boolean(newState)) { return false }
					const hasChanged = await effects.changeState(newState)
					if (hasChanged) {
						isOn = Boolean(newState)
						DEBUG && console.log(`LIGHT: ${description.id} turned ${isOn ? 'on' : 'off'}`)
						return true
					} else {
						return false
					}
				}
            },
            brightness: {
                get: () => brightness,
                set: async newBrightness => {
                    if (brightness === newBrightness) { return false }
                    const hasChanged = await effects.changeBrightness(newBrightness)
                    if (hasChanged) {
                        brightness = newBrightness
						DEBUG && console.log(`LIGHT: ${description.id} brightness set to ${brightness}%`)
                        return true
                    } else {
                        return false
                    }
                }
            }
        
		}
	})
}
