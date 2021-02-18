exports.up = knex => 
	knex.schema
		.createTable('subscription', table => {
			table.uuid('id').primary()
			table.string('id_publisher', 255).notNullable()
			table.string('id_subscriber', 255).notNullable()
			table.json('json_mapping').notNullable()
			table.boolean('is_active').notNullable()
			/**
			 * Concatenated ids of publisher and subscriber,
			 * it exists only to ensure that no subscriptions are
			 * duplicated or fragmented.
			 */
			table.string('id_pub_sub').unique().notNullable()
		})

exports.down = knex =>
	knex.schema
		.dropTableIfExists('subscription')
