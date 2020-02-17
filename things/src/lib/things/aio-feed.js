import fetch from 'node-fetch'

import { makeThing } from '../thing-tools'

const DEBUG = true

const updateAioFeed = ({
	username,
	aioKey,
	feedKey
}) => async data => {
	DEBUG && console.log(`AIO: updating ${feedKey}`)

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
	} else {
		DEBUG && console.log(`AIO: updated "${feedKey}" feed with value ${data}`)
		return responseBody
	}

}

export const makeAioFeed = ({
	description,
	config,
	// initialState,
	publishChange
}) => {

	DEBUG && console.log(`AIO: initializing ${feedKey}`)

	const {
		username,
		aioKey,
		feedKey
	} = config

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
		publishChange
	})({
		value: {
			set: async newValue => {
				updateFeed && await updateFeed(newValue)
				return false
			},
			get: () => null
		}
	})
}
