// NOTE: no ES6 module support

module.exports = {
	client: 'sqlite3',
	useNullAsDefault: true,
	connection: {
		filename: process.env.NODE_ENV === 'production'
			? '/data/db-things.sqlite'
			: './data/db-things.sqlite'
	},
	pool: {
		afterCreate: (connection, done) => connection.run('PRAGMA foreign_keys = ON', done)
	},
	migrations: {
		directory: './data/migrations'
	},
	seeds: {
		directory: './data/seeds'
	}
}
