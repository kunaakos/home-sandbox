function Thing(functions) {
	Object.assign(this, functions)
}

export const makeThing = ({
	type,
	description,
	publishChange,
	mutators
}) => {

	// get is synchronous, so should all getters on things be
	const get = () => {

		const currentState = Object.entries(mutators)
			.reduce(
				(acc, [key, { get }]) => {
					acc[key] = get()
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

	// set is an asynchronous operation, will complete when all values are updated
	// it is the responsibility of thing implementations to ensure that setters are async and resolve after values were updated
	const set = async newState => {
		const changes = await Promise.all(
			Object.entries(newState)
				.map(async ([key, newValue]) => {
					if (mutators.hasOwnProperty(key)) {
						return await mutators[key].set(newValue)
							? key
							: null
					} else {
						return null // TODO: warn if non-existing key was changed
					}
				})
				.filter(Boolean) // filter out falsy values, only Promises should be left in the array
		)
		const changedKeys = changes.filter(Boolean)
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
