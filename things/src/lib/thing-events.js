/**
 * A basic pubsub implementation, tailored for subscribing to Thing state changes.
 * Whenever a Thing changes its state, it should publish
 * a 'change' message with a list of keys for the values that changed.
 * If no list is passed, it is assumed that all values have changed.
 */

import EventEmitter from 'events'

import { generateUuid } from './utils'

function ThingEvents (functions) {
	Object.assign(this, functions)
}

export const makeThingEvents = () => {

	const emitter = new EventEmitter()
	const subscriptions = {}

	const publishChange = id => keys => { emitter.emit('change', { id, keys }) }

	const subscribeToChanges = handler => {
		const subscriptionId = generateUuid()
		emitter.on('change', handler)
		subscriptions[subscriptionId] = handler
		return subscriptionId
	}

	const unsubscribeFromChanges = subscriptionId => {
		emitter.off('change', subscriptions[subscriptionId])
		delete subscriptions[subscriptionId]
	}

	return new ThingEvents({
		publishChange,
		subscribeToChanges,
		unsubscribeFromChanges
	})

}
