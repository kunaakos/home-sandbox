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
	
	config: Joi.string()
		.required()

})

export const GatewayConfigUpdateSchema =
	GatewayConfigSchema
		.fork(
			['id'],
			schema => schema.forbidden()
		)
		.fork(
			['type', 'label', 'is_active', 'config'],
			schema => schema.optional()
		)

export const VirtualThingConfigSchema = GatewayConfigSchema
export const VirtualThingConfigUpdateSchema = GatewayConfigUpdateSchema

export const SubscriptionSchema = Joi.object({

	id: Joi.string()
		.guid({ version: ['uuidv4'] })
		.required(),
	
	publisher_id: Joi.string()
		.guid({ version: ['uuidv4'] })
		.required(),

	subscriber_id: Joi.string()
		.guid({ version: ['uuidv4'] })
		.required(),

	mapping: Joi.string()
		.required(),
	
	is_active: Joi.boolean()
		.required(),

})

export const SubscriptionUpdateSchema =
	SubscriptionSchema
		.fork(
			['id', 'publisher_id', 'subscriber_id'],
			schema => schema.forbidden()
		)
		.fork(
			['mapping', 'is_active'],
			schema => schema.optional()
		)

export const ThingIdSchema = Joi.object({

	id: Joi.string()
		.guid({ version: ['uuidv4'] })
		.required(),
	
	gateway_id: Joi.string()
		.guid({ version: ['uuidv4'] })
		.required(),

	fingerprint: Joi.string()
		.max(255)
		.required(),

})
