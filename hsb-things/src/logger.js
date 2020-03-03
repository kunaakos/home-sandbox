import { makeLogger } from 'hsb-service-utils/build/logger'

export const logger = makeLogger({
	serviceName: 'things',
	serviceColor: 'magenta',
	environment: process.env.NODE_ENV,
	forceLogLevel: process.env.HSB__LOG_LEVEL
})
