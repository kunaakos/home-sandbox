import Joi from 'joi'

export const GatewayConfigSchema = Joi.object({

	id: Joi.string().guid({ version: ['uuidv4'] })
		.required(),
	
	type: Joi.string()
		.max(255)
		.required(),

	label: Joi.string()
		.max(255)
		.required(),
	
	is_active: Joi.boolean()
		.required(),
	
	json_config: Joi.string()
		.required()

})

export const GatewayConfigUpdateSchema =
	GatewayConfigSchema
		.fork(
			['id'],
			schema => schema.forbidden()
		)
		.fork(
			['type', 'label', 'is_active', 'json_config'],
			schema => schema.optional()
		)

export const SubscriptionSchema = Joi.object({

	id: Joi.string()
		.guid({ version: ['uuidv4'] })
		.required(),
	
	id_publisher: Joi.string()
		.guid({ version: ['uuidv4'] })
		.required(),

	id_subscriber: Joi.string()
		.guid({ version: ['uuidv4'] })
		.required(),

	json_mapping: Joi.string()
		.required(),
	
	is_active: Joi.boolean()
		.required(),

	id_pub_sub: Joi.string()
		.max(255)
		.required(),

})

export const SubscriptionUpdateSchema =
	SubscriptionSchema
		.fork(
			['id', 'id_publisher', 'id_subscriber', 'id_pub_sub'],
			schema => schema.forbidden()
		)
		.fork(
			['json_mapping', 'is_active'],
			schema => schema.optional()
		)
