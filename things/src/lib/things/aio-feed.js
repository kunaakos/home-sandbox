import fetch from 'node-fetch'

import { makeThing } from '../thing'

const DEBUG = process.env.DEBUG

const updateAioFeed = ({
	username,
	aioKey,
	feedKey
}) => async data => {

	const response = await fetch(
		`https://io.adafruit.com/api/v2/${username}/feeds/${feedKey}/data`,
		{
			method: 'post',
			headers: {
				'Content-type': 'application/json',
				'X-AIO-KEY': aioKey
			},
			body: JSON.stringify({ datum: { value: data } })
		}
	)

	const responseBody = await response.json()

	if (responseBody.error) {
		throw new Error(responseBody.error)
	}

}

export const makeAioFeed = ({
	description,
	config,
	publishChange
}) => {

	const {
		username,
		aioKey,
		feedKey
	} = config

	DEBUG && console.log(`AIO: initializing ${feedKey} with id ${description.id}`)

	const updateFeed = username && aioKey && feedKey
		? updateAioFeed({ username, aioKey, feedKey })
		: null

	if (!updateFeed) {
		DEBUG && console.log('AIO: config missing, continuing in mock mode')
	}

	// this thing is write-only, so it does not report state changes
	// nor does it return any value when read
	return makeThing({
		type: 'metrics',
		description,
		publishChange,
		mutators: {
			value: {
				type: 'number',
				set: async newValue => {
					try {
						DEBUG && console.log(`AIO: updating ${feedKey} with ${newValue}`)
						updateFeed && await updateFeed(newValue)
						return true
					} catch (error) {
						return false
					}
				}
			}
		}
	})
}
