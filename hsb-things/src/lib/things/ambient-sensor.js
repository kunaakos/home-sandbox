import { makeThing } from '../thing'

import { logger } from '../../logger'

export const makeAmbientSensor = ({
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
