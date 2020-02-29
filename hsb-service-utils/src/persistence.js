import { MongoClient } from 'mongodb'

export const initMongodb = async ({
	dbName,
	dbUrl
}) => {

	const mongoClient = new MongoClient(`${dbUrl}/${dbName}`, { useNewUrlParser: true })
	await mongoClient.connect()
	return mongoClient.db(dbName)

}
