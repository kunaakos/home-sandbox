import { MongoClient } from 'mongodb'

export const initMongodb = async ({
	dbName,
	dbHost,
	dbPort,
	username,
	password
}) => {

	const mongoClient = new MongoClient(
		`mongodb://${username}:${password}@${dbHost}:${dbPort}/${dbName}`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true
		}
	)
	await mongoClient.connect()
	return mongoClient.db(dbName)

}
