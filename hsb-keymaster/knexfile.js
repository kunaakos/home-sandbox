// NOTE: no ES6 module support

module.exports = {
	client: 'sqlite3',
	useNullAsDefault: true,
	connection: {
		filename: process.env.NODE_ENV === 'production'
			? '/data/db-keymaster.sqlite'
			: './data/db-keymaster.sqlite'
	},
	migrations: {
		directory: './data/migrations'
	},
	seeds: {
		directory: './data/seeds'
	}
}
