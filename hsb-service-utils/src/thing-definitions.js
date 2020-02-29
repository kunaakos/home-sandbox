function ThingDefinition(functions) {
	Object.assign(this, functions)
}

const THING_DEFINITIONS_ID_SET_KEY = 'thingDefinitions'
const THING_DEFINITION_KEY_NAMESPACE = 'thingDefinition'

const thingDefinitionKey = id => `${THING_DEFINITION_KEY_NAMESPACE}:${id}`

export const makeThingDefinitions = ({
	redis,
	redisJson
}) => {

	const has = async id => Boolean(await redis.sismember(THING_DEFINITIONS_ID_SET_KEY, id))

	const getAllIds = () => redis.smembers(THING_DEFINITIONS_ID_SET_KEY)

	const getAll = async () => redisJson.mget(...(await getAllIds()).map(thingDefinitionKey), '.')

	const getOne = async id => redisJson.get(thingDefinitionKey(id))

	const add = async thingDefinition => {

		const id = thingDefinition.id

		if (await has(id)) {
			throw new Error(`cannot add definition with id ${thingDefinition.id}, it's already added`)
		}

		await redis.sadd(THING_DEFINITIONS_ID_SET_KEY, id)
		await redisJson.set(thingDefinitionKey(id), '.', thingDefinition)

		return thingDefinition.id

	}

	const update = async (id, newValues) => {

		if (!has(id)) {
			throw new Error(`cannot update thing definition with id ${id}, was not added`)
		}

		const currentValues = await getOne(id)

		if (currentValues === null) {
			throw new Error(`cannot update thing definition with id ${id}, data not found - this is a problem!`)
		}

		const updatedValues = {
			...currentValues,
			...newValues
		}

		await redisJson.set(thingDefinitionKey(id), '.', updatedValues)

		return updatedValues

	}

	const remove = async id => {

		if (!has(id)) {
			throw new Error(`cannot remove thing definition with id ${id}, was not added`)
		}

		await redis.srem(THING_DEFINITIONS_ID_SET_KEY, id)
		await redisJson.del(thingDefinitionKey(id), '.')

		return true
	}

	return new ThingDefinition({
		has,
		getAllIds,
		getAll,
		getOne,
		add,
		update,
		remove
	})

}
