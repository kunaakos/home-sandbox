import { MongoClient } from 'mongodb'

import { makeMongoCollection } from './collection'

export const initMongodb = async ({
	dbName,
	dbUrl
}) => {

	const mongoClient = new MongoClient(`${dbUrl}/${dbName}`, { useNewUrlParser: true })
	await mongoClient.connect()
	return mongoClient.db(dbName)

}

export const initDataModels = async ({
	mongoDatabase
}) => {

	return {
		ThingDefinitions: makeMongoCollection({ mongoDatabase, collectionName: 'thingDefinitions' }),
	}

}
