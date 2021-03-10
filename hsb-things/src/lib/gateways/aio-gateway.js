import fetch from 'node-fetch'
import upperFirst from 'lodash/upperFirst'

import { logger } from '../../logger'

import { makeDataSink } from '../things/data-sink'

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
		logger.debug(`AIO error: ${responseBody.error}`)
	} else {
		logger.trace(`AIO updated ${groupKey}.${feedKey}`)
	}

}

export const makeAioGateway = async ({
	id,
	config: {
		username,
		aioKey,
		groupKey,
		feeds
	},
	things
}) => {

	logger.info(`initializing adafruit.io gateway #${id}`)

	const mockMode = !(username && aioKey)

	if (mockMode) {
		logger.warn(`credentials missing for adafruit.io gateway #${id}, continuing in mock mode`)
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
					? data => { logger.trace(`mock adafruit.io update of '${groupKey ? `${groupKey}.` : ''}${feedKey}' with data '${data}'`) }
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

	await things.add(
		makeDataSink({
			fingerprint: 'AIO_FEEDS__ALL',
			gatewayId: id,
			label: 'adafruit.io feeds',
			isHidden: true,
			config: {
				values
			},
			effects
		})
	)

}
