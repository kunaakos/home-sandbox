/**
 * ThingStore holds references to Things, and can call their methods directly.
 * Things are read and updated via the store, never directly by any other thing or module. 
 */

function ThingStore (functions) {
	Object.assign(this, functions)
}

export const makeThingStore = ({
	thingStateChanged
}) => {

	const things = {}

	const has = id => Boolean(things[id])
	const get = id => things[id].get()

	const getAll = () =>
		Object.values(things)
		.map(thing => thing.get())

	const add = thing => {
		const thingId = thing.id
		things[thingId] = thing
		thingStateChanged(thingId)() // advertise state when added
	}
	
	const remove = id => { delete things[id] }

	const set = async (id, values) => {
		if (!has(id)) { return }
		await things[id].set(values)
	}
	
	return new ThingStore({
		has,
		get,
		getAll,
		add,
		remove,
		set
	})
}
