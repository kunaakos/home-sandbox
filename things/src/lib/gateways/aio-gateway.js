import fetch from 'node-fetch'
import upperFirst from 'lodash/upperFirst'

import { makeDataSink } from '../things/data-sink'

const mockUpdateAioFeed = ({
	logger,
	groupKey,
	feedKey
}) => async data => {
	logger.debug(`adafruit.io feed '${groupKey ? `${groupKey}.` : ''}${feedKey}' updated with data '${data}'`)
}

const updateAioFeed = ({
	username,
	aioKey,
	groupKey,
	feedKey
}) => async data => {

	const response = await fetch(
		`https://io.adafruit.com/api/v2/${username}/feeds/${groupKey ? `${groupKey}.` : ''}${feedKey}/data`,
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
		logger.debug(`adafruit.io feed '${groupKey ? `${groupKey}.` : ''}${feedKey}' updated with data '${data}'`)
	}

}

export const makeAioGateway = ({
	logger,
	description,
	config,
	things
}) => {

	logger.info(`initializing adafruit.io gateway #${description.id}`)

	const {
		username,
		aioKey,
		groupKey,
		feeds
	} = config

	const mockMode = !(username && aioKey)

	if (mockMode) {
		logger.warn(`credentials missing for adafruit.io gateway #${description.id}, continuing in mock mode`)
	}

	const { values, effects } = feeds
		.map(
			({ key, feedKey, reportOnUpdate, reportInterval }) => ({
				key,
				value: {
					key,
					type: 'number',
					reportOnUpdate,
					reportInterval
				},
				effect: mockMode
					? mockUpdateAioFeed({ logger, groupKey, feedKey })
					: updateAioFeed({ username, aioKey, groupKey, feedKey })
			})
		)
		.reduce(
			(acc, { key, value, effect }) => {
				return {
					values: [...acc.values, value],
					effects: {
						...acc.effects,
						[`report${upperFirst(key)}`]: effect
					}
				}
			},
			{
				values: [],
				effects: {}
			}
		)

	things.add(
		makeDataSink({
			logger,
			description: {
				id: 'aio-feeds',
				label: 'adafruit.io feeds',
				hidden: true
			},
			config: {
				values
			},
			effects
		})
	)

	return {
		type: 'aio-gateway',
		id: description.id
	}
}
