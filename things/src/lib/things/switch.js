import { makeThing } from '../thing'

const DEBUG = true

export const makeSwitch = ({
	description,
	effects,
	initialState,
	publishChange
}) => {

	DEBUG && console.log(`SWITCH: initializing ${description.id}`)

	let { isOn = false } = initialState

	return makeThing({
		type: 'switch',
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
						DEBUG && console.log(`SWITCH: ${description.id} turned ${isOn ? 'on' : 'off'}`)
						return true
					} else {
						return false
					}
				}
			}
		}
	})
}
