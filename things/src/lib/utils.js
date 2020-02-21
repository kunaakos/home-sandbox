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

// a strict set of rules about typecasting - not every possible cast would make sense in this application
export const typecast = (value, toType) => {

	const fromType = typeof value

	if (!['string', 'number', 'boolean'].includes(typeof fromType)) {
		throw new TypeError(`Attempted to cast ${fromType}.`)
	}

	switch (typeof value) {

		case 'string':
			switch (toType) {
				case 'string':
					return value
				case 'number':
				case 'boolean':
					throw new TypeError(`Cannot cast from ${fromType} to ${toType}`)
				default:
					throw new TypeError(`Cannot cast from ${fromType} to unkown type ${toType}`)
			}

		case 'number':
			switch (toType) {
				case 'string':
					return `${value}`
				case 'number':
					return value
				case 'boolean':
					throw new TypeError(`Cannot cast from ${fromType} to ${toType}`)
				default:
					throw new TypeError(`Cannot cast from ${fromType} to unkown type ${toType}`)
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
					throw new TypeError(`Cannot cast from ${fromType} to unkown type ${toType}`)
			}

		default:
			throw new TypeError(`Cannot cast from unknown type ${fromType}`)

	}

}
