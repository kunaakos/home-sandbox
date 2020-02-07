import EventEmitter from 'events'

let counter = 0
const thingEventsSubscriptions = {}

// all things will share the same EventEmitter instance...
const thingEvents = new EventEmitter()
export const thingStateChanged = thingId => keys => { thingEvents.emit('changed', { id: thingId, keys }) }
export const subscribeToThingStateChanges = handler => {
	counter++ // it's late and I want this done ASAP 🤷‍♂️ TODO: separate thing-events
	thingEvents.on('changed', handler)
	thingEventsSubscriptions[counter] = handler
	return counter
}
export const unsubscribeFromThingStateChanges = subscriptionId => {
	thingEvents.off('changed', thingEventsSubscriptions[subscriptionId])
	delete thingEventsSubscriptions[subscriptionId]
}

// ... and prototype. Don't use this to create things, just for runtime checks!
export function Thing(functions) {
	Object.assign(this, functions)
}

// HOF that returns a pair of functions that can be used to implement a thing
export const makeThingTools = args => ({
	// function that takes 'values' object and returns thing instance
	// id and settings applied, so this can only be used for one creating one thing only
	makeThing: makeThing(args),
	// callback that can be used to signal value changes
	// id is applied, so things can only emit for themselves
	stateChanged: thingStateChanged(args.id)
})

// curried function that makes things
const makeThing = ({
	type,
	id,
	label,
	hidden = false,
}) => (values = {}) => {

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
			thingStateChanged(id)(changedKeys)
		}
	}

	return new Thing({
		type,
		id,
		set,
		get
	})
} 
