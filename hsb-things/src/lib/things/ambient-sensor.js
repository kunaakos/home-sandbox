import { makeThing } from '../thing'

import { logger } from '../../logger'

const makeMutator = ({
	fingerprint,
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
			logger.trace(`ambient sensor #${fingerprint} property '${propertyName}' updated with value '${newValue}'`)
			return [propertyName]
		},
		get: () => state[propertyName]
	}
}

export const makeAmbientSensor = ({
	fingerprint,
	label,
	isHidden,
	initialState = {},
	properties
}) => {

	logger.debug(`initializing ambient sensor #${fingerprint}`)

	const state = {}

	const mutators = properties.reduce(
		(mutators, property) => {
			return {
				...mutators,
				[property.propertyName]: makeMutator({
					fingerprint,
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
		fingerprint,
		label,
		isHidden,
		mutators
	})

	return thing
}
