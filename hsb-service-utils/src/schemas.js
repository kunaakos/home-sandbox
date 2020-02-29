import Joi from '@hapi/joi'

export const User = Joi.object({

	username: Joi.string()
		.alphanum()
		.max(16)
		.required(),

	displayName: Joi.string()
		.required(),

	permissions: Joi.object({

		addUsers: Joi.boolean()
			.required(),

		modifySettings: Joi.boolean()
			.required(),

	}).required()

})

export const Password = Joi.object({

	value: Joi.string()
		.required(),

	updated: Joi.date().timestamp()
		.required()

})

export const Token = Joi.object({

	value: Joi.string()
		.required(),

	expires: Joi.date().timestamp()
		.required()

})
