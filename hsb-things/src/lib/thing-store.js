/**
 * ThingStore holds references to Things, and can call their methods directly.
 * Things are read and updated via the store, never directly by any other thing or module. 
 */

import { logger } from '../logger'

import { v4 as uuid } from 'uuid'

function ThingStore(functions) {
	Object.assign(this, functions)
}

export const makeThingStore = ({
	publishChange
}) => {

	const things = {}
	const thingIds = new Map()

	const getThingId = fingerprint => {
		if (thingIds.has(fingerprint)) {
			return thingIds.get(fingerprint)
		} else {
			thingIds.set(fingerprint, uuid())
			return thingIds.get(fingerprint)
		}
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

	const add = (thing, changedKeys) => {
		if (typeof thing.fingerprint !== 'string') {
			// TODO: validate properly
			logger.error(new Error(`store cannot add malformed thing #${JSON.stringify(thing)}`))
		} else {
			const thingId = getThingId(thing.fingerprint)
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
			errors.forEach(error => logger.error(error, `failed updating a property of #${id}`))
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
