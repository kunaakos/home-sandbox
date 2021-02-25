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
	SubscriptionUpdateSchema,
	ThingIdSchema
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
	const id = uuid()
	await knex(GATEWAY_CONFIG_TABLE).insert(
	  await GatewayConfigSchema.validateAsync(
		stringifyJsonPropertyIfAvailable('config')(
		  snakeCaseKeys({
			...gatewayConfig,
			id,
		  })
		)
	  )
	)
	return id
  }

export const readGatewayConfig = async idGateway => {
	const [gateway_config] = await knex(GATEWAY_CONFIG_TABLE).where({ id: idGateway })
	return camelCaseKeys(parseJsonPropertyIfAvailable('config')(gateway_config))
}

export const readGatewayConfigs = async () => {
	const gateway_configs = await knex(GATEWAY_CONFIG_TABLE)
	return gateway_configs
		.map(parseJsonPropertyIfAvailable('config'))
		.map(camelCaseKeys)
}

export const updateGatewayConfig = async ({
	id: idGatewayConfig,
	...gatewayConfigUpdate
}) => 
	knex(GATEWAY_CONFIG_TABLE)
		.where({ id: idGatewayConfig})
		.update(await GatewayConfigUpdateSchema.validateAsync(stringifyJsonPropertyIfAvailable('config')(snakeCaseKeys(gatewayConfigUpdate))))

export const removeGatewayConfig = async idGateway =>
	knex(GATEWAY_CONFIG_TABLE).where({ id: idGateway }).del()


const SUBSCRIPTION_TABLE = 'subscription'

export const addSubscription = async subscription => {
	const id = uuid()
	await knex(SUBSCRIPTION_TABLE).insert(
		await SubscriptionSchema.validateAsync(
			stringifyJsonPropertyIfAvailable('mapping')(
				snakeCaseKeys({
					...subscription,
					id
				})
			)
		)
	)
	return id
}

export const readSubscriptions = async () => {
	const subscriptions = await knex(SUBSCRIPTION_TABLE)
	return subscriptions
		.map(parseJsonPropertyIfAvailable('mapping'))
		.map(camelCaseKeys)
}

export const updateSubscription = async ({subscriptionId, ...subscriptionUpdate}) =>{
	return await knex(SUBSCRIPTION_TABLE)
		.where({ id: subscriptionId })
		.update(
			await SubscriptionUpdateSchema.validateAsync(
				stringifyJsonPropertyIfAvailable('mapping')(
					snakeCaseKeys(subscriptionUpdate)
				)
			)
		)
}

export const removeSubscription = async subscriptionId =>
	knex(SUBSCRIPTION_TABLE).where({ id: subscriptionId }).del()


const THING_ID_TABLE = 'thing_id'

export const addThingId = async ({ fingerprint, gatewayId }) => {
	const id = uuid()
	await knex(THING_ID_TABLE).insert(
		await ThingIdSchema.validateAsync(
			snakeCaseKeys({
				id,
				fingerprint,
				gatewayId
			})
		)
	)
	return id
}

export const readThingIds = async () => {
	const things = await knex(THING_ID_TABLE)
	return things
		.map(parseJsonPropertyIfAvailable('mapping'))
		.map(camelCaseKeys)
}

export const removeThingId = async id =>
	knex(THING_ID_TABLE).where({ id }).del()
