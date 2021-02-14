import Joi from '@hapi/joi'

export const DisplayName = Joi.string()
	.max(255)
	.required()

export const User = Joi.object({
	
	id: Joi.string().guid({ version: ['uuidv4'] })
		.required(),

	display_name: DisplayName,

	status: Joi.string()
		.required()
		.valid('onboarding', 'inactive', 'active'),

	privileges: Joi.array()
		.items(Joi.string().valid('admin'))
		.required()

})

export const Credentials = Joi.object({

	id_user: Joi.string().guid({ version: ['uuidv4'] })
		.required(),

	username: Joi.string()
		.alphanum()
		.max(32)
		.required(),

	password_hash: Joi.string()
		.required(),

	password_updated_at: Joi.date().timestamp()
		.required()

})

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
