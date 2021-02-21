import Knex from 'knex'
import knexConfig from '../knexfile'
import { v4 as uuid } from 'uuid'
import {
	mapKeys,
	camelCase,
	snakeCase
} from 'lodash' 

import {
	GatewayConfigSchema,
	GatewayConfigUpdateSchema,
	SubscriptionSchema,
	SubscriptionUpdateSchema
} from './db-schemas'

const knex = Knex(knexConfig)

const mapPropertyIfAvailable = (object, key, fn) => 
	object.hasOwnProperty(key)
		? {
			...object,
			[key]: fn(object[key])
		}
		: object

const parseJsonPropertyIfAvailable = key => object => mapPropertyIfAvailable(object, key, JSON.parse)
const stringifyJsonPropertyIfAvailable = key => object => mapPropertyIfAvailable(object, key, JSON.stringify)

const camelCaseKeys = object => mapKeys(object, (value, key) => camelCase(key))
const snakeCaseKeys = object => mapKeys(object, (value, key) => snakeCase(key))

const GATEWAY_CONFIG_TABLE = 'gateway_config'

export const addGatewayConfig = async (gatewayConfig) => {
	const idGatewayConfig = uuid()
	await knex(GATEWAY_CONFIG_TABLE).insert(
	  await GatewayConfigSchema.validateAsync(
		stringifyJsonPropertyIfAvailable('json_config')(
		  snakeCaseKeys({
			...gatewayConfig,
			id: idGatewayConfig,
		  })
		)
	  )
	)
	return idGatewayConfig
  }

export const readGatewayConfig = async idGateway => {
	const [gateway_config] = await knex(GATEWAY_CONFIG_TABLE).where({ id: idGateway })
	return camelCaseKeys(parseJsonPropertyIfAvailable('json_config')(gateway_config))
}

export const readGatewayConfigs = async () => {
	const data = await knex(GATEWAY_CONFIG_TABLE)
	return data
		.map(parseJsonPropertyIfAvailable('json_config'))
		.map(camelCaseKeys)
}

export const updateGatewayConfig = async ({
	id: idGatewayConfig,
	...gatewayConfigUpdate
}) => 
	knex(GATEWAY_CONFIG_TABLE)
		.where({ id: idGatewayConfig})
		.update(await GatewayConfigUpdateSchema.validateAsync(stringifyJsonPropertyIfAvailable('json_config')(snakeCaseKeys(gatewayConfigUpdate))))

export const removeGatewayConfig = async idGateway =>
	knex(GATEWAY_CONFIG_TABLE).where({ id: idGateway }).del()


const SUBSCRIPTION_TABLE = 'subscription'

export const addSubscription = async subscription => {
	const idSubscription = uuid()
	await knex(SUBSCRIPTION_TABLE).insert(
		await SubscriptionSchema.validateAsync(
			stringifyJsonPropertyIfAvailable('json_mapping')(
				snakeCaseKeys({
					...subscription,
					id: idSubscription,
					idPubSub: `${subscription.idPublisher}_${subscription.idSubscriber}`
				})
			)
		)
	)
	return idSubscription
}

export const readSubscriptions = async () => {
	const subscriptions = await knex(SUBSCRIPTION_TABLE)
	return subscriptions
		.map(parseJsonPropertyIfAvailable('json_mapping'))
		.map(camelCaseKeys)
}

export const updateSubscription = async ({idSubscription, ...subscriptionUpdate}) =>{
	return await knex(SUBSCRIPTION_TABLE)
		.where({ id: idSubscription })
		.update(
			await SubscriptionUpdateSchema.validateAsync(
				stringifyJsonPropertyIfAvailable('json_mapping')(
					snakeCaseKeys(subscriptionUpdate)
				)
			)
		)
}

export const removeSubscription = async idSubscription =>
	knex(SUBSCRIPTION_TABLE).where({ id: idSubscription }).del()
