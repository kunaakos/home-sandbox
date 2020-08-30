
exports.up = function (knex) {
	return knex.schema
		.createTable('users', function (table) {
			table.increments('id')
			table.string('username', 255).unique().notNullable()
			table.string('display_name', 255).unique().notNullable()
			table.json('permissions', 1000).notNullable()
		})
		.createTable('credentials', function (table) {
			table.string('username', 255).unique().notNullable()
			table.string('password_hash', 255).notNullable()
			table.datetime('password_hash_updated_at').notNullable().defaultTo(knex.fn.now())
		})
}

exports.down = function (knex) {
	return knex.schema
		.dropTableIfExists('users')
		.dropTableIfExists('credentials')
}
