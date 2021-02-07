import Knex from 'knex'
import knexConfig from '../knexfile'
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'

import {
	User,
	Credentials
} from './schemas'

const knex = Knex(knexConfig)

export const getCredentials = async username => {

	const [data] = await knex('credentials')
		.select('id_user', 'username', 'password_hash')
		.where({ username })

	return data
		? {
			idUser: data.id_user,
			username: data.username,
			passwordHash: data.password_hash,
		}
		: null
}

export const getUser = async idUser => {
	const [user] = await knex('user').where({ id: idUser })
	return {
		id: user.id,
		displayName: user.display_name,
		permissions: JSON.parse(user.permissions)
	}
}

export const getUsers = async () => {
	const data = await knex('user')
	return data.map(user => ({
		id: user.id,
		username: user.username,
		displayName: user.display_name,
		permissions: JSON.parse(user.permissions)
	}))
}

export const addUser = async ({
	username,
	password,
	displayName,
	permissions,
}) => {

	const trx = await knex.transaction()

	try {

		const idUser = uuid()

		const user = await User.validateAsync({
			id: idUser,
			display_name: displayName,
			permissions: JSON.stringify(permissions) // TODO: validate permissions
		})
		await trx('user').insert(user)

		const credentials = await Credentials.validateAsync({
			id_user: idUser,
			username: username,
			password_hash: await bcrypt.hash(password, 10),
			password_updated_at: Date.now()
		})
		await trx('credentials').insert(credentials)

		await trx.commit()
		return idUser

	} catch (error) {
		trx.rollback()
		throw new Error(`Could not add user: ${error.message}`)
	}

}

export const removeUser = async userData => {
	try {
		await knex('user').where({ id: userData.id }).del()
		return userData.id
	} catch (error) {
		throw new Error(`Could not remove user: ${error.message}`)
	}
}
