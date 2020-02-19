import {
	makeThing,
	setterFromEffect
} from '../thing'

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

	const defaults = {
		isOn: false,
		...(Boolean(isDimmable) && {
			brightness: 100
		}),
		...(Boolean(isColor) && {
			color: 'ffffff'
		}),
		...(Boolean(colorTemperatureRange) && {
			colorTemperature: 4000
		})
	}

	const state = {
		defaults,
		...initialState
	}

	return makeThing({
		type: 'light',
		description,
		publishChange,
		mutators: {
			isOn: {
				get: () => state.isOn,
				set: setterFromEffect(effects.changeState, state, 'isOn') 
			},
			...(isDimmable && {
				brightness: {
					get: () => state.brightness,
					set: setterFromEffect(effects.changeBrightness, state, 'brightness')
				}
			}),
			...(isColor && {
				color: {
					get: () => state.color,
					set: setterFromEffect(effects.changeColor, state, 'color')
				}
			}),
			...(Boolean(colorTemperatureRange) && {
				colorTemperature: {
					get: () => state.colorTemperature,
					set: setterFromEffect(effects.changeColorTemperature, state, 'colorTemperature')
				}
			})
		}
	})
}
