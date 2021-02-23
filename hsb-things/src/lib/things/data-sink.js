import upperFirst from 'lodash/upperFirst'

import { makeThing } from '../thing'
import { makeWatchdog } from '../watchdog'

import { logger } from '../../logger'

export const makeDataSink = ({
	fingerprint,
	label,
	isHidden,
	config,
	effects
}) => {

	logger.debug(`initializing data sink #${fingerprint}`)

	const {
		values
	} = config

	const mutators = values
		.reduce(
			(
				acc,
				{
					key,
					type,
					reportInterval,
					reportOnUpdate
				}) => {

				let value
				const updateFeed = v => (value !== undefined) && effects[`report${upperFirst(key)}`](v)

				// if reportInterval is set, create a watchdog that will trigger a report after
				// the set time interval if no new value was received
				// NOTE: the watchdog will be started by the first value update (no undefined values will be reported)
				const watchdog = reportInterval
					? makeWatchdog({
						interval: reportInterval,
						selfReset: true,
						onTimedOut: () => {
							updateFeed(value)
						}
					})
					: null
				
				watchdog && watchdog.pet()

				acc[key] = {
					type,
					skipEqualityCheck: true,
					set: async newValue => {
						logger.trace(`data sink #${fingerprint} property '${key}' updated with value '${newValue}'`)
						if (reportOnUpdate) {
							watchdog && watchdog.pet()
							value = newValue
							await updateFeed(value)
						} else {
							value = newValue
						}
						return []
					}
				}

				return acc
			},
			{}
		)

	return makeThing({
		type: 'data-sink',
		fingerprint,
		label,
		isHidden,
		mutators,
	})
}
