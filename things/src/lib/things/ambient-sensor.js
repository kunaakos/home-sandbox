import { makeThing } from '../thing'

export const makeAmbientSensor = ({
	logger,
	description,
	initialState
}) => {

	logger.debug(`initializing ambient sensor #${description.id}`)

	let { temperature = 0 } = initialState

	return makeThing({
		type: 'ambient-sensor',
		description,
		mutators: {
			temperature: {
				type: 'number',
				skipEqualityCheck: true,
				set: async newValue => {
					temperature = newValue
					logger.trace(`ambient sensor #${description.id} property 'temperature' updated with value '${temperature}'`)
					return ['temperature']
				},
				get: () => temperature
			}
		}
	})
}
