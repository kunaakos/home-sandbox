import { makeLogger } from 'hsb-service-utils/build/logger'

export const logger = makeLogger({
	serviceName: 'things',
	serviceColor: 'magenta',
	environment: process.env.ENV,
	forceLogLevel: process.env.LOG_LEVEL
})
