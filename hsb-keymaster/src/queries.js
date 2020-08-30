import Knex from 'knex'
import knexConfig from '../knexfile'
import bcrypt from 'bcrypt'

import { logger } from './logger'

import {
	User,
	Credential
} from './schemas'

const knex = Knex(knexConfig)

export const getUserCredentials = async requestedUsername => {
	const [data] = await knex('credentials').where({ username: requestedUsername })
	return {
		username: data.username,
		passwordHash: data.password_hash,
		passwordHashUpdatedAt: data.password_hash_updated_at
	}
}

export const getUser = async requestedUsername => {
	const [data] = await knex('users').where({ username: requestedUsername })
	return {
		id: data.id,
		username: data.username,
		displayName: data.display_name,
		permissions: JSON.parse(data.permissions)
	}
}

export const addUser = async userData => {

	const trx = await knex.transaction()

	try {

		const user = await User.validateAsync({
			username: userData.username,
			display_name: userData.displayName,
			permissions: JSON.stringify(userData.permissions)
		})
		const credential = await Credential.validateAsync({
			username: userData.username,
			password_hash: await bcrypt.hash(userData.password, 10),
			password_hash_updated_at: Date.now()
		})

		const [idUser] = await trx('users').insert(user)
		await trx('credentials').insert(credential)
		await trx.commit()

		return idUser

	} catch (error) {
		trx.rollback()
		logger.error(error)
		throw new Error(`Could not add user because "${error.message}"`)
	}

}
