import { makeThing } from '../thing-tools' 

const DEBUG = true

export const makeAmbientSensor = async ({
	id,
	label,
	hidden = true,
	publishChange,
	initialValues = {}
}) => {

	DEBUG && console.log(`SENSOR: initializing ${id}`)

	let { temperature } = initialValues

	return makeThing ({
		type: 'ambient-sensor',
		id,
		label,
		hidden,
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
