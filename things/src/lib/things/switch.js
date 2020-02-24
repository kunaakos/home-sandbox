import { makeThing } from '../thing'
import { setterFromEffect } from '../utils'

export const makeSwitch = ({
	logger,
	description,
	effects,
	initialState
}) => {

	logger.debug(`initializing switch #${description.id}`)

	const state = {
		isOn: false,
		...initialState
	}

	return makeThing({
		type: 'switch',
		description,
		mutators: {
			isOn: {
				type: 'boolean',
				get: () => state.isOn,
				set: setterFromEffect({
					logger,
					thingId: description.id,
					effect: effects.changeState,
					state,
					key: 'isOn'
				})
			}
		}
	})
}
