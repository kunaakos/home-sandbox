import { makeThingTools } from '../thing-tools' 

const DEBUG = true

export const makeAmbientSensor = async ({
	id,
	label,
	hidden = true,
	initialValues = {}
}) => {

	DEBUG && console.log(`SENSOR: initializing ${id}`)

	const { makeThing, stateChanged } = makeThingTools({
		type: 'ambient-sensor',
		id,
		label,
		hidden
	})

	let { temperature } = initialValues

	return makeThing ({
		temperature: {
			set: async newValue => {
				temperature = newValue
				stateChanged(['temperature'])
			},
			get: () => temperature
		}
	})
}
