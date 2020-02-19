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

		// an array of async functions that resolve with:
		// ['key', null] - if a mutation wasn't attempted
		// ['key', true] - if the mutation was successful
		// ['key', false] - if the mutation failed
		const mutations = Object.entries(newState)

			// check if property exists and is writeable
			.filter(
				([key,]) => {
					const { isReadable, isWriteable } = checkPermissions(mutators, key)
					if (!isReadable && !isWriteable) {
						console.warn(`Attempted mutation of inexistent property ${key} of ${description.id}.`)
						return false
					} else if (!isWriteable) {
						console.warn(`Attempted mutation of read-only property ${key} of ${description.id}.`)
						return false
					} else {
						return true
					}
				}
			)

			// attempt a mutation if needed
			.map(
				async ([key, newValue]) => {
					const attemptMutation = isReadable(mutators, key)
						? mutators[key].get() !== newValue // no need for a mutation if the value hasn't changed
						: true // write-only properties are always mutated

					return attemptMutation
						? [key, await mutators[key].set(newValue)]
						: [key, null]
				}	
			)

		const mutationResults = await Promise.all(mutations)
		const changedKeys = mutationResults
			.filter(([, result]) => Boolean(result)) // no need to publish changes for failed or unattempted mutations
			.map(([key,]) => key)

		if (changedKeys.length) {
			publishChange(description.id)(changedKeys)
		}
	}

	return new Thing({
		type,
		id: description.id,
		set,
		get
	})
} 
