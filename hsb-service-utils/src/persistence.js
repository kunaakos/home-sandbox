

import { MongoClient } from 'mongodb'

import { makeThingDefinitions } from './thing-definitions'

export const initDataModels = async ({
	dbName,
	dbPort,
	dbHost
}) => {

	const client = new MongoClient(`mongodb://${dbHost}:${dbPort}/${dbName}`, { useNewUrlParser: true })
	await client.connect()
	const db = client.db(dbName)

	return {
		ThingDefinitions: makeThingDefinitions({ db }),
	}

}
