import { makeThing } from '../thing'
import { setterFromEffect } from '../utils'

import { logger } from '../../logger'

export const makeLight = ({
	fingerprint,
	gatewayId,
	label,
	isHidden,
	isColor,
	isDimmable,
	colorTemperatureRange,
	effects,
	initialState
}) => {

	logger.debug(`initializing light #${fingerprint}`)

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
		fingerprint,
		gatewayId,
		label,
		isHidden,
		isColor,
		isDimmable,
		colorTemperatureRange,
		mutators: {
			isOn: {
				type: 'boolean',
				get: () => state.isOn,
				set: setterFromEffect({
					fingerprint,
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
						fingerprint,
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
						fingerprint,
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
						fingerprint,
						effect: effects.changeColorTemperature,
						state,
						key: 'colorTemperature'
					})
				}
			})
		}
	})
}
