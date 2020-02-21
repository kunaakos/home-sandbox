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
	publishChange,
	mutators
}) => {

	// get is synchronous
	const get = () => {

		const currentState = Object.entries(mutators)
			.map(
				([key, { get }]) => ([
					key,
					get
						? get() // get current value of readable properties
						: null // return null for write-only properties
				])
			)
			.reduce(
				(acc, [key, value]) => {
					acc[key] = value
					return acc
				},
				{}
			)

		return {
			type,
			...description,
			...currentState
		}
	}

	// set will complete when all attempted mutations were finished
	const set = async newState => {

		const mutations = Object.entries(newState)
			.filter(
				// check if a mutation is possible and needed
				([key, newValue]) => {
					const { isReadable, isWriteable } = checkPermissions(mutators, key)
					if (!isReadable && !isWriteable) {
						console.warn(`Attempted mutation of inexistent property ${key} of ${description.id}.`)
						return false
					} else if (!isWriteable) {
						console.warn(`Attempted mutation of read-only property ${key} of ${description.id}.`)
						return false
					} else {
						const skipEqualityCheck = !isReadable || Boolean(mutators[key].skipEqualityCheck)
						return skipEqualityCheck
							? true
							: mutators[key].get() !== newValue
					}
				}
			)
			.map(
				// attempt mutation
				async ([key, newValue]) => {

					try {
						const result = await mutators[key].set(typecast(newValue, mutators[key].type))

						if (typeof result === 'boolean') {
							// the setter changed the value it was declared for, or nothing
							return result ? [key] : []
						} else if (
							Array.isArray(result) &&
							result.every(element => typeof element === 'string')
						) {
							// the setter returned with an array of keys for the values it changed
							return result
						} else {
							// the setter is probably borked
							throw new Error(`Setter '${key}' of thing '${description.id}' returned with invalid value: ${result}`)
						}

					} catch (error) {
						// mutation failed
						console.error(error)
						return []
					}

				}
			)

		const results = await Promise.all(mutations)
		const changedKeys = uniq(results.flat())

		if (changedKeys.length) {
			publishChange(description.id)(changedKeys)
		}
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

export const setterFromEffect = (effect, state, key) => async newValue => {
	const result = await effect(newValue)
	if (result === null) {
		return false
	} else {
		// the new state should be a validated, rounded etc. value returned by the effect
		state[key] = result
		return true
	}
}
