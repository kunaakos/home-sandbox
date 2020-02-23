import { makeThing } from '../thing'
import { setterFromEffect } from '../utils'

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
				set: setterFromEffect({
					logger,
					thingId: description.id,
					effect: effects.changeState,
					state,
					key: 'isOn'
				})
			},
			...(isDimmable && {
				brightness: {
					type: 'number',
					get: () => state.brightness,
					set: setterFromEffect({
						logger,
						thingId: description.id,
						effect: effects.changeBrightness,
						state,
						key: 'brightness'
					})
				}
			}),
			...(isColor && {
				color: {
					type: 'string',
					get: () => state.color,
					set: setterFromEffect({
						logger,
						thingId: description.id,
						effect: effects.changeColor,
						state,
						key: 'color'
					})
				}
			}),
			...(Boolean(colorTemperatureRange) && {
				colorTemperature: {
					type: 'number',
					get: () => state.colorTemperature,
					set: setterFromEffect({
						logger,
						thingId: description.id,
						effect: effects.changeColorTemperature,
						state,
						key: 'colorTemperature'
					})
				}
			})
		}
	})
}
