import fetch from 'node-fetch'

import { Thing } from './thing'

const DEBUG = true

const updateAioFeed = async ({
	username,
	aioKey,
	feedKey
}) =>
	async data => {
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

export const AioFeed = ({
	id,
	label,
	username,
	aioKey,
	feedKey
}) => {

	DEBUG && console.log('AIO: initializing')

	let updateFeed = async () => { }

	if (!username || !aioKey || !feedKey) {
		DEBUG && console.log('AIO: config missing, continuing in mock mode')
	} else {
		updateFeed = updateAioFeed({ username, aioKey, feedKey })
	}

	const values = {
		value: {
			set: updateFeed,
			get: () => null
		}
	}

	return Thing({
		type: 'metrics',
		id,
		label,
		hidden: true,
		values
	})
}
