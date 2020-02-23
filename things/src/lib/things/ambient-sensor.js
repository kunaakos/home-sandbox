import { makeThing } from '../thing'

const DEBUG = process.env.DEBUG

export const makeAmbientSensor = ({
	logger,
	description,
	initialState,
	publishChange
}) => {

	logger.debug(`initializing ambient sensor #${description.id}`)

	let { temperature = 0 } = initialState

	return makeThing({
		logger,
		type: 'ambient-sensor',
		description,
		publishChange,
		mutators: {
			temperature: {
				type: 'number',
				skipEqualityCheck: true,
				set: async newValue => {
					temperature = newValue
					logger.trace(`ambient sensor #${description.id} property 'temperature' updated with value '${temperature}'`)
					return true
				},
				get: () => temperature
			}
		}
	})
}
