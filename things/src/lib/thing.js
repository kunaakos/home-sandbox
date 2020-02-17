// Don't use this to create things, just for runtime checks!
function Thing(functions) {
	Object.assign(this, functions)
}

export const makeThing = ({
	type,
	description,
	publishChange
}) => (values = {}) => {

	// get is synchronous, so should all getters on things be
	const get = () => {

		const currentState = Object.entries(values)
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
	const set = async newValues => {
		const changes = await Promise.all(
			Object.entries(newValues)
				.map(([key, newValue]) => {
					if (values.hasOwnProperty(key)) {
						return values[key].set(newValue)
							.then(hasChanged => {
								return hasChanged
									? key
									: null
							})
					} else {
						return null // TODO: warn if non-existing key was changed
					}
				})
				.filter(Boolean) // filter out falsy values, only Promises are kept
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
