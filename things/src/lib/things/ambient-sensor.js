import { makeThing } from '../thing'

const DEBUG = process.env.DEBUG

export const makeAmbientSensor = ({
	description,
	initialState,
	publishChange
}) => {

	DEBUG && console.log(`SENSOR: initializing ${description.id}`)

	let { temperature = 0 } = initialState

	return makeThing({
		type: 'ambient-sensor',
		description,
		publishChange,
		mutators: {
			temperature: {
				type: 'number',
				skipEqualityCheck: true,
				set: async newValue => {
					temperature = newValue
					return true
				},
				get: () => temperature
			}
		}
	})
}
