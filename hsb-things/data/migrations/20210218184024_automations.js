exports.up = knex => 
	knex.schema
		.createTable('subscription', table => {
			table.uuid('id').primary()
			table.string('publisher_id', 255).notNullable()
			table.string('subscriber_id', 255).notNullable()
			table.unique(['publisher_id', 'subscriber_id'])
			table.json('mapping').notNullable()
			table.boolean('is_active').notNullable()
		})
		.createTable('thing_id', table => {
			table.uuid('id').primary()
			table.string('fingerprint', 255).notNullable()
			table.uuid('gateway_id')
			table.foreign('gateway_id').references('gateway_config.id').onDelete('CASCADE')
			table.unique(['gateway_id', 'fingerprint'])
		})

exports.down = knex =>
	knex.schema
		.dropTableIfExists('subscription')
		.dropTableIfExists('thing_id')
