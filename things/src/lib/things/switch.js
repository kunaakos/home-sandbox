import {
	makeThing,
	setterFromEffect
} from '../thing'

const DEBUG = process.env.DEBUG

export const makeSwitch = ({
	description,
	effects,
	initialState,
	publishChange
}) => {

	DEBUG && console.log(`SWITCH: initializing ${description.id}`)

	const state = {
		isOn: false,
		...initialState
	}

	return makeThing({
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
