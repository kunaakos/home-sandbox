/**
 * ThingStore holds references to Things, and can call their methods directly.
 * Things are read and updated via the store, never directly by any other thing or module. 
 */

import { logger } from '../logger'

function ThingStore(functions) {
	Object.assign(this, functions)
}

const thingIdsReducer = (thingIds, { id, fingerprint, gatewayId }) => {
	return {
		...thingIds,
		[gatewayId]: {
			...(thingIds[gatewayId] || {}),
			[fingerprint]: id
		}
	}
}

export const makeThingStore = async ({
	publishChange,
	addThingId,
	readThingIds,
	removeThingId
}) => {

	const things = {}
	const thingIds = (await readThingIds()).reduce(thingIdsReducer, {})

	const getThingId = ({ fingerprint, gatewayId }) => 
		thingIds[gatewayId] && thingIds[gatewayId][fingerprint]

	const storeThingId = async ({ fingerprint, gatewayId, predefinedThingId }) => {
		logger.debug(`store received new device #${fingerprint} from gateway #${gatewayId}`)
			const newThingId = await addThingId({ fingerprint, gatewayId, predefinedThingId })
			if (!thingIds[gatewayId]) {
				thingIds[gatewayId] = {}
			}
			thingIds[gatewayId][fingerprint] = newThingId
			return newThingId
	}

	const has = id => Boolean(things[id])

	const hasProperty = (id, property) => {
		const thing = things[id]
		if (!Boolean(thing)) { return false }
		const thingProperties = Object.keys(thing.get())
		return thingProperties.some(thingProperty => thingProperty === property)
	}

	const get = id => {
		if (!has(id)) {
			throw new Error(`cannot get state of inexistent thing #${id}`)
		} else {
			const result = things[id].get()
			if (result instanceof Error) {
				logger.error(result, `store failed getting state of #${id}`)
				return null
			} else {
				return {
					id,
					...result
				}
			}
		}
	}

	const getAll = () =>
		Object.keys(things)
			.map(id => get(id))
			.filter(Boolean)

	const add = async (thing, changedKeys, predefinedThingId) => {
		if (typeof thing.fingerprint !== 'string' || typeof thing.gatewayId !== 'string') {
			// TODO: validate properly
			logger.error(new Error(`store cannot add malformed thing #${JSON.stringify(thing)}`))
		} else {
			const thingId =
				getThingId({ fingerprint: thing.fingerprint, gatewayId: thing.gatewayId })
				|| await storeThingId({ fingerprint: thing.fingerprint, gatewayId: thing.gatewayId, predefinedThingId })
			things[thingId] = thing
			publishChange(thingId)(changedKeys)
			return thingId
		}
	}

	const remove = id => { delete things[id] }

	const set = async (id, values) => {
		if (!has(id)) {
			logger.error(new Error(`cannot update state of inexistent thing #${id}`))
		} else {
			const [changedKeys, errors] = await things[id].set(values)
			changedKeys.length && publishChange(id)(changedKeys)
			errors.forEach(error => logger.debug(error, `failed updating a property of #${id}`))
		}
	}

	const typeOf = (id, key) => { return things[id].typeOf(key) } 

	return new ThingStore({
		has,
		hasProperty,
		get,
		getAll,
		add,
		remove,
		set,
		typeOf
	})
}
