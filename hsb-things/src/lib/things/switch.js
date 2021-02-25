import { makeThing } from '../thing'
import { setterFromEffect } from '../utils'

import { logger } from '../../logger'

export const makeSwitch = ({
	fingerprint,
	gatewayId,
	label,
	isHidden,
	effects,
	initialState
}) => {

	logger.debug(`initializing switch #${fingerprint}`)

	const state = {
		isOn: false,
		...initialState
	}

	return makeThing({
		type: 'switch',
		fingerprint,
		gatewayId,
		label,
		isHidden,
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
			}
		}
	})
}
