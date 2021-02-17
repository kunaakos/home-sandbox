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
	GatewayConfigUpdateSchema
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
	knex('gateway_config').where({ id: idGateway }).del()
