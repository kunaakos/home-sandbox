export const Thing = ({
	type,
	id,
	label,
	hidden = false,
	values = {}
}) => {

	// get is synchronous, so should all getters on things be
	const get = () => {
		const resolvedValues = Object.entries(values)
			.reduce(
				(acc, [key, { get }]) => {
					acc[key] = get()
					return acc
				},
				{}
			)

		return {
			type,
			id,
			label,
			hidden,
			...resolvedValues
		}
	}

	// set is an asynchronous operation, will complete when all values are updated
	// it is the responsibility of thing implementations to ensure that setters are async and resolve after values were updated
	const set = async newValues => {
		await Promise.all(
			Object.entries(newValues)
				.map(([key, newValue]) => values.hasOwnProperty(key) && values[key].set(newValue)) // false or Promise
				.filter(Boolean) // filter out falsy values, only Promises are kept
		)
	}

	return {
		type,
		id,
		set,
		get
	}
} 
