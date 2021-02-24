exports.up = knex => 
	knex.schema
		.createTable('subscription', table => {
			table.uuid('id').primary()
			table.string('publisher_id', 255).notNullable()
			table.string('subscriber_id', 255).notNullable()
			table.unique(['publisher_id', 'subscriber_id'])
			table.json('json_mapping').notNullable()
			table.boolean('is_active').notNullable()
		})

exports.down = knex =>
	knex.schema
		.dropTableIfExists('subscription')
