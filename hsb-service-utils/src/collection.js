
function Collection(props) {
	Object.assign(this, props)
}

export const makeMongoCollection = ({
	mongoDatabase,
	collectionName
}) => {

	const collection = mongoDatabase.collection(collectionName)

	const getAll = async () => {

		try {
			return collection
				.find({})
				.toArray()
		} catch (error) {
			throw new Error('could not get items')
		}
	}

	const getOne = async id => {

		try {
			collection
				.findOne(
					{ _id: id }
				)
		} catch (error) {
			throw new Error(`could not get item #${id}`)
		}

 	}

	const add = async (id, object) => {

		try {
			const {
				result: {
					n,
					ok
				}
			} = await collection
				.insertOne({
					...object,
					_id: id
				})
			if (!ok || n === 0) {
				throw null
			} else {
				return true
			}
		} catch (error) {
			throw new Error(`could not add item ${id}`)
		}
		
	}

	const update = async (id, newValues) => {
		
		try {
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
			throw new Error(`could not update item #${id}`)
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
			throw new Error(`could not remove item #${id}`)
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
