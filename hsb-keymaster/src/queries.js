import Knex from 'knex'

const knex = Knex({
	client: 'sqlite3',
	connection: {
	  filename: process.env.NODE_ENV === 'production'
	   ? '/data/db-keymaster.sqlite'
	   : '../../data/keymaster/db-keymaster.sqlite'
	}
})

export const getUserCredentials = username => {
	return null
}

export const getUser = idUser => {
	return null
}
