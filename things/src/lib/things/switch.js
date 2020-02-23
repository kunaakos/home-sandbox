import {
	makeThing,
	setterFromEffect
} from '../thing'

export const makeSwitch = ({
	logger,
	description,
	effects,
	initialState,
	publishChange
}) => {

	logger.debug(`initializing switch #${description.id}`)

	const state = {
		isOn: false,
		...initialState
	}

	return makeThing({
		logger,
		type: 'switch',
		description,
		publishChange,
		mutators: {
			isOn: {
				type: 'boolean',
				get: () => state.isOn,
				set: setterFromEffect(effects.changeState, state, 'isOn')
			}
		}
	})
}
