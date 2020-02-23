/**
 * This module propagates state changes.
 * It's not optimized for anything other than brevity and readability.
 * It's similar to a pub/sub implementation, but does not hold references
 * to subscribers (things), because things are never guaranteed to be present.
 * They may become disconnected from the network for various reasons:
 * a battery dies, someone takes a device with them etc.
 * 
 * Subscriptions object schema:
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

import { delay } from './utils'

const ONE_SECOND = 1000
const TOTAL_UPDATE_ATTEMPTS = 3

export const handleSubscriptions = ({
	logger,
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

		const thingSubscriptions = Object.entries(subscriptions[publisherId]) // array of [subscriberId, [[publisherKey, subscriberKey]...]]

		thingSubscriptions.forEach(
			([subscriberId, keyMaps]) => {

				// this recursive function will attempt an updating a subscriber three times with a one second delay between retries
				// it's needed during bootstrapping, when things are being added in no particular order
				// TODO: make this configurable if needed (most things are permanently connected at the time of writing this)
				const attemptSubscriberUpdate = async attemptNr => {

					if (attemptNr >= TOTAL_UPDATE_ATTEMPTS) {
						logger.warn(`subscriber #${subscriberId} is offline.`)
						return
					}

					if (!things.has(subscriberId)) {
						await delay(ONE_SECOND)
						return attemptSubscriberUpdate(attemptNr + 1)
					}

					const publisherState = things.get(publisherId)

					const newValues = keyMaps
						.filter(
							([publisherKey,]) => Boolean(changedKeys) // if a list of changed keys were not passed, we're assuming all have changed
								? changedKeys.includes(publisherKey)
								: true
						)
						.reduce(
							(acc, [publisherKey, subscriberKey]) => {
								acc[subscriberKey] = publisherState[publisherKey]
								return acc
							},
							{}
						)

					if (!Object.keys(newValues).length) { return }

					things.set(subscriberId, newValues)

				}

				attemptSubscriberUpdate(1).catch(error => console.error)

			}
		)

	}

	subscribeToChanges(onStateChange)
}
