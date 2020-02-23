/**
 * Misc. utility functions.
 */

export const delay = miliseconds => {
	return new Promise(resolve => {
		setTimeout(resolve, miliseconds)
	})
}

// taken from: https://gist.github.com/jed/982883
export const generateUuid = placeholder =>
	placeholder
		? (placeholder ^ Math.random() * 16 >> placeholder / 4).toString(16)
		: ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, generateUuid)

export const preciseRound = (number, decimals) => Math.round((number + Number.EPSILON) * 10 * decimals) / (10 * decimals)

// a strict set of rules about typecasting - not every possible cast would make sense in this application
export const typecast = (value, toType) => {

	const fromType = typeof value

	if (!['string', 'number', 'boolean'].includes(typeof fromType)) {
		throw new TypeError(`Attempted to cast from unsupported type '${fromType}'.`)
	}

	switch (typeof value) {

		case 'string':
			switch (toType) {
				case 'string':
					return value
				case 'number':
				case 'boolean':
					throw new TypeError(`Cannot cast from '${fromType}' to '${toType}'`)
				default:
					throw new TypeError(`Cannot cast from '${fromType}' to unkown type '${toType}'`)
			}

		case 'number':
			switch (toType) {
				case 'string':
					return `${value}`
				case 'number':
					return value
				case 'boolean':
					throw new TypeError(`Cannot cast from '${fromType}' to '${toType}'`)
				default:
					throw new TypeError(`Cannot cast from '${fromType}' to unkown type '${toType}'`)
			}

		case 'boolean':
			switch (toType) {
				case 'string':
					return value ? 'TRUE' : 'FALSE'
				case 'number':
					return value ? 1 : 0
				case 'boolean':
					return value
				default:
					throw new TypeError(`Cannot cast from '${fromType}' to unkown type '${toType}'`)
			}

		default:
			throw new TypeError(`Cannot cast from unknown type '${fromType}'`)

	}

}

export const setterFromEffect = ({
	logger,
	thingId,
	effect,
	state,
	key
}) => async newValue => {
	const result = await effect(newValue)
	if (result === null) {
		logger.trace(`#${thingId} effect for property '${key}' returned with 'null', a state change is expected later.`)
		return false
	} else if (typeof result !== typeof newValue) {
		logger.warn(`#${thingId} effect for property '${key}' returned with value of type '${typeof result}' instead of '${typeof newValue}'`)
	} {
		// the new state should be a validated, rounded etc. value returned by the effect
		state[key] = result
		logger.trace(`thing #${thingId} property '${key}' updated with value '${newValue}'`)
		return true
	}
}
