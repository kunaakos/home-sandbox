/**
 *  Subscriptions object schema:
 * 
 *  const schema = {
 *  	'thingId': {
 *  		'subscriberId': [
 *  			['publisherKey', 'subscriberKey'],
 *  			// ...
 *  		],
 *  		// ... 
 *  	},
 *  	// ... 
 *  }
 * 
 */

// a strict set of rules about typecasting - not every possible cast would make sense in this application
const typecast = (value, toType) => {

	const fromType = typeof value

	if (!['string', 'number', 'boolean'].includes(typeof fromType)) {
		throw new Error(`Attempted to cast ${fromType}.`)
	}
	
	switch (typeof value) {

		case 'string':
			switch (toType) {
				case 'string':
					return value
				case 'number':
				case 'boolean':
					throw new Error(`Cannot cast from ${fromType} to ${toType}`)
				default:
					throw new Error(`Cannot cast from ${fromType} to unkown type ${toType}`)
			}
		
		case 'number':
			switch (toType) {
				case 'string':
					return `${value}`				
				case 'number':
					return value
				case 'boolean':
					throw new Error(`Cannot cast from ${fromType} to ${toType}`)
				default:
					throw new Error(`Cannot cast from ${fromType} to unkown type ${toType}`)
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
					throw new Error(`Cannot cast from ${fromType} to unkown type ${toType}`)
			}
			
		default:
			throw new Error(`Cannot cast from unknown type ${fromType}`)

	}

}

export const handleSubscriptions = ({
	things,
	subscriptions,
	subscribeToChanges
}) => {

	const onStateChange = ({
		id: publisherId,
		keys: changedKeys
	}) => {

		// nothing is subscribed to this thing
		if (!subscriptions[publisherId]) { return }

		const publisherState = things.get(publisherId)
		const thingSubscriptions = Object.entries(subscriptions[publisherId]) // array of [subscriberId, [[publisherKey, subscriberKey]...]]

		thingSubscriptions.forEach(
			([subscriberId, keyMaps]) => {

				if (!things.has(subscriberId)) {
					console.warn(`subscriber with id ${subscriberId} is offline.`)
					return
				}

				const newValues = keyMaps
					.filter(
						([publisherKey, ]) => Boolean(changedKeys) // if a list of changed keys were not passed, we're assuming all have changed
							? changedKeys.includes(publisherKey)
							: true	
					)
					.reduce(
						(acc, [publisherKey, subscriberKey]) => {
							const value = publisherState[publisherKey]
							acc[subscriberKey] = typecast(
								value,
								things.typeOf(subscriberId, subscriberKey) // cannot duck-type write-only values
							)
							return acc
						},
						{}
					)

				if (!Object.keys(newValues).length) { return }

				things.set(subscriberId, newValues)
			}
		)

	}

	subscribeToChanges(onStateChange)
}
