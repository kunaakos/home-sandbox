import Joi from '@hapi/joi'

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
