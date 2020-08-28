import Joi from '@hapi/joi'

export const User = Joi.object({

	username: Joi.string()
		.alphanum()
		.max(16)
		.required(),

	displayName: Joi.string()
		.required(),

	permissions: Joi.array()
		.items(Joi.string())
		.required()

})

export const Password = Joi.object({

	username: Joi.string()
		.required(),

	hash: Joi.string()
		.required(),

	updatedAt: Joi.date().timestamp()
		.required()

})
