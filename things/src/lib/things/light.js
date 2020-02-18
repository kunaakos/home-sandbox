import { makeThing } from '../thing'

const DEBUG = true

export const makeLight = ({
	description,
	effects,
	initialState,
	publishChange
}) => {

	DEBUG && console.log(`LIGHT: initializing ${description.id}`)

	const {
		isColor,
		isDimmable,
		colorTemperatureRange
	} = description

	let {
		isOn = false,
		brightness = 100,
		color = 'ffffff', // TODO: hue/saturation values instead of RGB? makes more sense for lights
		colorTemperature = 4000
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
			...(isDimmable && {
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
			}),
			...(isColor && {
				color: {
					get: () => color,
					set: async newColor => {
						if (color === newColor) { return false }
						const hasChanged = await effects.changeColor(newColor)
						if (hasChanged) {
							color = newColor
							DEBUG && console.log(`LIGHT: ${description.id} color set to ${color}%`)
							return true
						} else {
							return false
						}
					}
				}
			}),
			...(Boolean(colorTemperatureRange) && {
				colorTemperature: {
					get: () => colorTemperature,
					set: async newColorTemperature => {
						if (colorTemperature === newColorTemperature) { return false }
						const hasChanged = await effects.changeColorTemperature(newColorTemperature)
						if (hasChanged) {
							colorTemperature = newColorTemperature
							DEBUG && console.log(`LIGHT: ${description.id} colorTemperature set to ${colorTemperature}%`)
							return true
						} else {
							return false
						}
					}
				}
			})
		}
	})
}
