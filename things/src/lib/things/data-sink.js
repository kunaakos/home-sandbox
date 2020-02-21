import upperFirst from 'lodash/upperFirst'

import { makeThing } from '../thing'
import { makeWatchdog } from '../watchdog'

const DEBUG = process.env.DEBUG

const neverPublishChange = () => () => { console.warn('Something is borked, a data sink advertised a state change.') }

export const makeDataSink = ({
	description,
	config,
	effects
}) => {

	DEBUG && console.log(`DATA SINK: initializing '${description.id}'`)

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
				const updateFeed = effects[`report${upperFirst(key)}`]

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

				acc[key] = {
					type,
					skipEqualityCheck: true,
					set: async newValue => {
						DEBUG && console.log(`DATA SINK: '${description.id}' value '${key}' updated with ${newValue}`)
						if (reportOnUpdate) {
							watchdog && watchdog.pet()
							value = newValue
							updateFeed(value)
						} else {
							state[key] = newValue
						}
						return false
					}
				}

				return acc
			},
			{}
		)

	return makeThing({
		type: 'data-sink',
		description,
		mutators,
		publishChange: neverPublishChange
	})
}
