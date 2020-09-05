import { makeThing } from '../thing'

import { logger } from '../../logger'

const makeMutator = ({
	description,
	initialState,
	state,
	type,
	propertyName,
	skipEqualityCheck = true,
}) => {
	state[propertyName] = initialState[propertyName]
	return {
		type,
		skipEqualityCheck,
		set: async newValue => {
			state[propertyName] = newValue
			logger.trace(`ambient sensor #${description.id} property '${propertyName}' updated with value '${newValue}'`)
			return [propertyName]
		},
		get: () => state[propertyName]
	}
}

export const makeAmbientSensor = ({
	description,
	initialState = {},
	properties
}) => {

	logger.debug(`initializing ambient sensor #${description.id}`)

	const state = {}

	const mutators = properties.reduce(
		(mutators, property) => {
			return {
				...mutators,
				[property.propertyName]: makeMutator({
					description,
					initialState,
					state,
					...property
				})
			}
		},
		{}
	)

	const thing =  makeThing({
		type: 'ambient-sensor',
		description,
		mutators
	})

	return thing
}
