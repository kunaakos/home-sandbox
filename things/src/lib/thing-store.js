/**
 *  Subscriptions object schema:
 * 
 *  const subscriptions = {
 *     'thingId': {
 *         'subscriberId': {
 *             'thingKey': 'subscriberKey'
 *         }
 *     }
 * }
 * 
 */

const mapValues = (oldValues, keyMap) => {
	const newValues = {}
	Object.entries(keyMap)
		.forEach(
			([oldValueKey, newValueKey]) => newValues[newValueKey] = oldValues[oldValueKey]
		)
	return newValues
}

export const ThingStore = ({
	subscriptions
}) => {

	const things = {}

	const has = id => Boolean(things[id])
	const get = id => things[id].get()

	const add = (id, thing) => { 
		things[id] = thing
		propagateStateChanges(id)
	}

	const remove = id => { delete things[id] }

	const set = async (id, values) => {
		if (!has(id)) { return }
		await things[id].set(values)
		propagateStateChanges(id)
	}

	const propagateStateChanges = async id => {
		const thingSubscriptions = subscriptions[id]
		if (!thingSubscriptions) { return }

		const thingState = get(id)

		Object.entries(thingSubscriptions)
			.forEach(([subscriberId, keyMap]) => {
				if (!has(subscriberId)) { return }
				set(subscriberId, mapValues(thingState, keyMap))
			})

	}
	
	return {
		has,
		get,
		add,
		remove,
		set,
		update: () => { propagateStateChanges() }
	}
}
