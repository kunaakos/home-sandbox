import uniq from 'lodash/uniq'

import { typecast } from './utils'

function Thing(functions) {
	Object.assign(this, functions)
}

const isWriteable = (mutators, key) => mutators.hasOwnProperty(key) && Boolean(mutators[key].set)
const isReadable = (mutators, key) => mutators.hasOwnProperty(key) && Boolean(mutators[key].get)

const checkPermissions = (mutators, key) => ({
	isReadable: isReadable(mutators, key),
	isWriteable: isWriteable(mutators, key)
})

export const makeThing = ({
	type,
	description,
	mutators
}) => {

	// returns: State | Error
	const get = () => {

		try {
			const currentState = Object.entries(mutators)
				.reduce(
					(acc, [key, { type, get }]) => {
						if (!get) {
							acc[key] = null // property is write-only
							return acc
						} else {
							const result = get()
							if (typeof result !== type) {
								throw new Error(`getter for property '${key}' of #${description.id} returned with a value of type '${typeof value}' instead of expected '${type}'`)
							} else {
								acc[key] = result
								return acc
							}
						}
					},
					{}
				)

			return {
				type,
				...description,
				...currentState
			}
		} catch (error) {
			return error
		}

	}

	// returns: [string[], Error[]]
	const set = async newState => {

		const mutations = Object.entries(newState)
			.map(
				([key, newValue]) => {

					try {
						const { isReadable, isWriteable } = checkPermissions(mutators, key)

						// check if the mutation is possible (value exists and is writeable)
						if (!isReadable && !isWriteable) {
							return [key, null, new Error(`attempted mutation of inexistent property '${key}'`)]
						} else if (!isWriteable) {
							return [key, null, new Error(`attempted mutation of read-only property '${key}'`)]
						} else {

							// typecast new value
							const typecastResult = typecast(newValue, mutators[key].type)
							if (typecastResult instanceof Error) {
								return [key, null, typecastResult]
							}

							// perform the equality check if needed
							// always skip it for write-only values, or mutators that have equality checks disabled
							const shouldUpdate =
								!isReadable ||
								mutators[key].skipEqualityCheck ||
								mutators[key].get() !== typecastResult // NOTE: get() could throw if borked

							if (shouldUpdate) {
								return [key, typecastResult, null]
							} else {
								return [key, null, null]
							}

						}

					} catch (error) {
						return [key, null, error]
					}

				}
			)

			.map(

				async ([
					key, // string
					newValue, // some value of expected type | null
					error // null | Error
				]) => {

					try {
						if (newValue === null || error !== null) {
							return [key, newValue, error]
						} else {

							const result = await mutators[key].set(newValue) // NOTE: set() could throw if borked
							if (
								Array.isArray(result) &&
								result.every(element => typeof element === 'string')
							) {
								return [key, result, null]
							} else {
								return [key, null, new Error(`setter for property '${key}' returned with invalid result ${JSON.stringify(result)}`)]
							}
						}

					} catch (error) {
						return [key, null, error]
					}

				}

			)

		const results = await Promise.all(mutations) // NOTE: Promise.all() could reject if the above implementation is borked

		const { changedKeys, errors } = results
			.reduce(
				(acc, [, changedKeys, error]) => {
					if (error !== null) {
						acc.errors.push(error)
					} else if (changedKeys !== null) {
						acc.changedKeys = [acc.changedKeys, ...changedKeys]
					}
					return acc
				},
				{
					changedKeys: [], // string[]
					errors: [] // Error[]
				}
			)

		return [uniq(changedKeys), errors]

	}

	const typeOf = key => mutators[key] && mutators[key].type

	return new Thing({
		type,
		id: description.id,
		set,
		get,
		typeOf
	})
}
