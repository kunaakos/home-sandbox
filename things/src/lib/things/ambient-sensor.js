import { Thing } from './thing' 

const DEBUG = true

export const AmbientSensor = async ({
	id,
	label,
	initialValues = {}
}) => {

	DEBUG && console.log(`SENSOR: initializing ${id}`)

	let { temperature } = initialValues

	const values = {
		temperature: {
			set: async newValue => { temperature = newValue },
			get: () => temperature
		}
	}

	return Thing({
		type: 'ambient-sensor',
		id,
		label,
		hidden: true,
		values
	})
}
