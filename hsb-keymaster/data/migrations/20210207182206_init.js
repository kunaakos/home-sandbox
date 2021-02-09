
exports.up = function (knex) {
	return knex.schema
		.createTable('user', function (table) {
			table.uuid('id').primary()
			table.string('display_name', 255).unique().notNullable()
			table.string('status', 16).notNullable()
			table.json('privileges', 1000).notNullable()
		})
		.createTable('credentials', function (table) {
			table.uuid('id_user').primary()
			table.foreign('id_user').references('user.id').onDelete('CASCADE')
			table.string('username', 255).unique().notNullable()
			table.string('password_hash', 255).notNullable()
			table.datetime('password_updated_at').notNullable().defaultTo(knex.fn.now())
		})
}

exports.down = function (knex) {
	return knex.schema
		.dropTableIfExists('user')
		.dropTableIfExists('credentials')
		.raw('PRAGMA foreign_keys = OFF')
}
