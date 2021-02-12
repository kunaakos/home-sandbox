import Knex from 'knex'
import knexConfig from '../knexfile'
import { v4 as uuid } from 'uuid'

import {
	DisplayName,
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
		status: user.status,
		privileges: JSON.parse(user.privileges)
	}
}

export const getUsers = async () => {
	const data = await knex('user')
	return data.map(user => ({
		id: user.id,
		displayName: user.display_name,
		status: user.status,
		privileges: JSON.parse(user.privileges)
	}))
}

export const addUser = async ({
	displayName,
	privileges,
}) => {

	try {

		const user = await User.validateAsync({
			id: uuid(),
			display_name: displayName,
			status: 'onboarding',
			privileges: privileges
		})

		await knex('user').insert({
			...user,
			privileges: JSON.stringify(user.privileges)
		})

		return user.id

	} catch (error) {
		throw new Error(`Could not add user: ${error.message}`)
	}

}

export const removeUser = async idUser => {
	try {
		await knex('user').where({ id: idUser }).del()
		return idUser
	} catch (error) {
		throw new Error(`Could not remove user: ${error.message}`)
	}
}

export const activateUser = async idUser => {
	try {
		await knex('user')
			.where({ id: idUser })
			.update({ status: 'active' })
	} catch (error) {
		throw new Error(`Could not activate user: ${error.message}`)
	}
}

export const deactivateUser = async idUser => {
	try {
		await knex('user')
			.where({ id: idUser })
			.update({ status: 'inactive' })
	} catch (error) {
		throw new Error(`Could not deactivate user: ${error.message}`)
	}
}

export const onboardUser = async ({
	idUser,
	displayName,
	username,
	passwordHash,
	activate
}) => {

	const trx = await knex.transaction()

	try {

		const credentials = await Credentials.validateAsync({
			id_user: idUser,
			username: username,
			password_hash: passwordHash,
			password_updated_at: Date.now()
		})

		const [user] = await trx('user')
			.where({ id: idUser })

		if (!user || user.status !=='onboarding') {
			throw new Error('user not found or has already finished the onboarding process')
		}

		await trx('user')
			.where({ id: idUser })
			.update({
				status: activate ? 'active' : 'inactive',
				display_name: await DisplayName.validateAsync(displayName)
			})

		await trx('credentials').insert(credentials)

		await trx.commit()	
		return idUser

	} catch (error) {
		trx.rollback()
		throw new Error(`Could not onboard user: ${error.message}`)
	}

}
