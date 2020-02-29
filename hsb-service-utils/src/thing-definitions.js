
const OMIT_ID = { _id: 0 }

function ThingDefinitions(functions) {
	Object.assign(this, functions)
}

const THING_DEFINITIONS_COLLECTION_NAME = 'thingDefinitions'
export const makeThingDefinitions = ({
	db
}) => {

	const collection = db.collection(THING_DEFINITIONS_COLLECTION_NAME)

	const getAll = async () => {
		try {
			return collection
				.find({})
				.project(OMIT_ID)
				.toArray()
		} catch (error) {
			throw new Error(`could not get thing definitions (${error.message})`)
		}
	}

	const getOne = async id =>
		collection
			.findOne(
				{ id },
				{
					projection: OMIT_ID
				}
			)

	const add = async thingDefinition => {
		const {
			result: {
				n,
				ok
			}
		} = await collection
			.insertOne(
				thingDefinition
			)
		if (!ok || n === 0) {
			throw new Error(`could not add thing definition #${thingDefinition.id}`)
		} else {
			return true
		}
	}

	const update = async (id, newValues) => {
		const {
			ok,
			value
		} = await collection
			.findOneAndUpdate(
				{ id },
				{ $set: newValues },
				{
					returnOriginal: false,
					projection: OMIT_ID
				}
			)
		if (ok && value) {
			return value
		} else {
			throw new Error(`could not add thing definition #${id}`)
		}
	}

	const remove = async id => {
		const {
			ok,
			value
		} = await collection
			.findOneAndDelete(
				{ id }
			)
		if (ok && value) {
			return true
		} else {
			throw new Error(`could not remove thing definition #${id}`)
		}
	}

	return new ThingDefinitions({
		getAll,
		getOne,
		add,
		update,
		remove
	})

}
