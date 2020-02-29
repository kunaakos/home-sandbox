
function Collection(props) {
	Object.assign(this, props)
}

const isValidId = id => /^[a-z0-9\-]{1,32}$/.test(id)

export const makeMongoCollection = ({
	mongoDatabase,
	collectionName,
	schema
}) => {

	const collection = mongoDatabase.collection(collectionName)

	const getAll = async () => {

		try {

			return collection
				.find({})
				.toArray()

		} catch (error) {
			throw new Error(`could not get items${error ? `: ${error.message}` : ''}`)
		}

	}

	const getOne = async id => {

		try {

			return collection
				.findOne(
					{ _id: id }
				)

		} catch (error) {
			throw new Error(`could not get item #${id}${error ? `: ${error.message}` : ''}`)
		}

	}

	const add = async (id, object) => {

		try {

			if (!isValidId(id)) {
				throw null
			}

			const { error, value } = schema.validate(object)

			if (error) {
				throw error
			}

			const {
				result: {
					n,
					ok
				}
			} = await collection
				.insertOne({
					...value,
					_id: id
				})

			if (!ok || n === 0) {
				throw null
			} else {
				return true
			}

		} catch (error) {
			throw new Error(`could not add item #${id}${error ? `: ${error.message}` : ''}`)
		}

	}

	const update = async (id, object) => {

		try {

			const { error, value: newValues } = schema.validate(object)

			if (error) {
				throw error
			}

			const {
				ok,
				value
			} = await collection
				.findOneAndUpdate(
					{ _id: id },
					{ $set: newValues },
					{
						returnOriginal: false,
					}
				)

			if (ok && value) {
				return value
			} else {
				throw null
			}


		} catch (error) {
			throw new Error(`could not update item #${id}${error ? `: ${error.message}` : ''}`)
		}

	}

	const remove = async id => {

		try {

			const {
				ok,
				value
			} = await collection
				.findOneAndDelete(
					{ _id: id }
				)

			if (ok && value) {
				return true
			} else {
				throw null
			}

		} catch (error) {
			throw new Error(`could not remove item #${id}${error ? `: ${error.message}` : ''}`)
		}

	}

	return new Collection({
		getAll,
		getOne,
		add,
		update,
		remove
	})

}
