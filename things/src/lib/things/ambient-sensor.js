import { makeThing } from '../thing' 

const DEBUG = true

export const makeAmbientSensor = async ({
	description,
	// config,
	initialState,
	publishChange
}) => {

	DEBUG && console.log(`SENSOR: initializing ${description.id}`)

	let { temperature = 0 } = initialState

	return makeThing ({
		type: 'ambient-sensor',
		description,
		publishChange
	})({
		temperature: {
			set: async newValue => {
				temperature = newValue
				return true
			},
			get: () => temperature
		}
	})
}
