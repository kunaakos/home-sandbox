import Redis from "ioredis"
import RedisJson from "iorejson"

import { makeThingDefinitions } from './thing-definitions'

export const initDataModels = async ({
	appId,
	port,
	host
}) => {

	const options = {
		port,
		host
	}

	const redis = new Redis(options)
	redis.on('error', error => console.error(error))

	const redisJson = new RedisJson(options)
	redisJson.on('error', error => console.error(error))

	const args = {
		redis,
		redisJson,
		appId
	}

	return {
		ThingDefinitions: makeThingDefinitions(args),
	}

}
