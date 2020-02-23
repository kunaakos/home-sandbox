import {
	makeThing,
	setterFromEffect
} from '../thing'

export const makeLight = ({
	logger,
	description,
	effects,
	initialState,
	publishChange
}) => {

	logger.debug(`initializing light #${description.id}`)

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
		logger,
		type: 'light',
		description,
		publishChange,
		mutators: {
			isOn: {
				type: 'number',
				get: () => state.isOn,
				set: setterFromEffect(effects.changeState, state, 'isOn') 
			},
			...(isDimmable && {
				brightness: {
					type: 'number',
					get: () => state.brightness,
					set: setterFromEffect(effects.changeBrightness, state, 'brightness')
				}
			}),
			...(isColor && {
				color: {
					type: 'string',
					get: () => state.color,
					set: setterFromEffect(effects.changeColor, state, 'color')
				}
			}),
			...(Boolean(colorTemperatureRange) && {
				colorTemperature: {
					type: 'number',
					get: () => state.colorTemperature,
					set: setterFromEffect(effects.changeColorTemperature, state, 'colorTemperature')
				}
			})
		}
	})
}
