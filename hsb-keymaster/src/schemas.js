import Joi from '@hapi/joi'

export const User = Joi.object({
	
	id: Joi.string().guid({ version: ['uuidv4'] })
		.required(),

	display_name: Joi.string()
		.required(),

	status: Joi.string()
		.required(),

	privileges: Joi.string()
		.required()

})

export const Credentials = Joi.object({

	id_user: Joi.string().guid({ version: ['uuidv4'] })
		.required(),

	username: Joi.string()
		.alphanum()
		.max(16)
		.required(),

	password_hash: Joi.string()
		.required(),

	password_updated_at: Joi.date().timestamp()
		.required()

})
