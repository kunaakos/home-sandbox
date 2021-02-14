exports.up = knex => 
	knex.schema
		.createTable('gateway_config', table => {
			table.uuid('id').primary()
			table.string('type', 255).unique().notNullable()
			table.string('label', 255).unique().notNullable()
			table.boolean('is_active').notNullable()
			table.json('json_config').notNullable()
		})

exports.down = knex =>
	knex.schema
		.dropTableIfExists('gateway_config')
