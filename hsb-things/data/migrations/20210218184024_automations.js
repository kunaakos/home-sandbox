exports.up = knex => 
	knex.schema
		.createTable('subscription', table => {
			table.uuid('id').primary()
			table.string('id_publisher', 255).notNullable()
			table.string('id_subscriber', 255).notNullable()
			table.unique(['id_publisher', 'id_subscriber'])
			table.json('json_mapping').notNullable()
			table.boolean('is_active').notNullable()
		})

exports.down = knex =>
	knex.schema
		.dropTableIfExists('subscription')
