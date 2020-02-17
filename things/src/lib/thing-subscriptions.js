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

export const handleSubscriptions = ({
	things,
	subscribeToChanges,
	subscriptions
}) => {

	const propagateStateChanges = ({
		id,
		keys // TODO: propagate only if relevant values changed
	}) => {

		const thingSubscriptions = subscriptions[id]
		if (!thingSubscriptions) { return }
		const thingState = things.get(id)

		Object.entries(thingSubscriptions)
			.forEach(([subscriberId, keyMap]) => {
				if (!things.has(subscriberId)) { return }
				things.set(subscriberId, mapValues(thingState, keyMap))
			})

	}

	subscribeToChanges(propagateStateChanges)
}
