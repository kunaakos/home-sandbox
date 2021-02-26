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
	VirtualThingConfigSchema,
	VirtualThingConfigUpdateSchema,
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
const AUTOMATIONS_GATEWAY_ID = `4a4a4a4a-4a4a-4a4a-a4a4-a4a4a4a4a4a4` // hahaha

export const addGatewayConfig = async gatewayConfig => {
	const id = gatewayConfig.id || uuid()
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

export const readGatewayConfig = async id => {
	const [gateway_config] = await knex(GATEWAY_CONFIG_TABLE).where({ id })
	if (!gateway_config) { return null }
	return camelCaseKeys(parseJsonPropertyIfAvailable('config')(gateway_config))
}

export const readGatewayConfigs = async () => {
	const gateway_configs = await knex(GATEWAY_CONFIG_TABLE).whereNot({ id: AUTOMATIONS_GATEWAY_ID })
	return gateway_configs
		.map(parseJsonPropertyIfAvailable('config'))
		.map(camelCaseKeys)
}

export const updateGatewayConfig = async ({
	id,
	...gatewayConfigUpdate
}) => {
	if (id === AUTOMATIONS_GATEWAY_ID) { throw new Error('that\'s a no') }
	await knex(GATEWAY_CONFIG_TABLE)
		.where({ id })
		.update(await GatewayConfigUpdateSchema.validateAsync(stringifyJsonPropertyIfAvailable('config')(snakeCaseKeys(gatewayConfigUpdate))))
}
	
export const removeGatewayConfig = async id => {
	if (id === AUTOMATIONS_GATEWAY_ID) { throw new Error('that\'s a no') }
	await knex(GATEWAY_CONFIG_TABLE).where({ id }).del()
}


const VIRTUAL_THING_CONFIG_TABLE = 'virtual_thing_config'

export const addVirtualThingConfig = async virtualThingConfig => {
	const id = uuid()
	await knex(VIRTUAL_THING_CONFIG_TABLE).insert(
		await VirtualThingConfigSchema.validateAsync(
			stringifyJsonPropertyIfAvailable('config')(
				snakeCaseKeys({
					...virtualThingConfig,
					id,
				})
			)
		)
	)
	return id
}

export const readVirtualThingConfig = async id => {
	const [gateway_config] = await knex(VIRTUAL_THING_CONFIG_TABLE).where({ id })
	if (!gateway_config) { return null }
	return camelCaseKeys(parseJsonPropertyIfAvailable('config')(gateway_config))
}

export const readVirtualThingConfigs = async () => {
	const gateway_configs = await knex(VIRTUAL_THING_CONFIG_TABLE).whereNot({ id: AUTOMATIONS_GATEWAY_ID })
	return gateway_configs
		.map(parseJsonPropertyIfAvailable('config'))
		.map(camelCaseKeys)
}

export const updateVirtualThingConfig = async ({
	id,
	...virtualThingConfigUpdate
}) => {
	await knex(VIRTUAL_THING_CONFIG_TABLE)
		.where({ id })
		.update(await VirtualThingConfigUpdateSchema.validateAsync(
			stringifyJsonPropertyIfAvailable('config')(
				snakeCaseKeys(virtualThingConfigUpdate)
			)
		))
}
	
export const removeVirtualThingConfig = async id => {
	await knex(VIRTUAL_THING_CONFIG_TABLE).where({ id }).del()
}


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

export const updateSubscription = async ({ id, ...subscriptionUpdate }) =>{
	return await knex(SUBSCRIPTION_TABLE)
		.where({ id })
		.update(
			await SubscriptionUpdateSchema.validateAsync(
				stringifyJsonPropertyIfAvailable('mapping')(
					snakeCaseKeys(subscriptionUpdate)
				)
			)
		)
}

export const removeSubscription = async id =>
	knex(SUBSCRIPTION_TABLE).where({ id }).del()


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
