import Joi from '@hapi/joi'

export const User = Joi.object({

	username: Joi.string()
		.alphanum()
		.max(16)
		.required(),

	display_name: Joi.string()
		.required(),

	permissions: Joi.string()
		.required()

})

export const Credential = Joi.object({

	username: Joi.string()
		.required(),

	password_hash: Joi.string()
		.required(),

	password_hash_updated_at: Joi.date().timestamp()
		.required()

})
