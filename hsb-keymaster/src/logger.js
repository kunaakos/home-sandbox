import { makeLogger } from 'hsb-service-utils/build/logger'

export const logger = makeLogger({
	serviceName: 'kymstr',
	serviceColor: 'yellow',
	environment: process.env.NODE_ENV,
	forceLogLevel: process.env.HSB__LOG_LEVEL
})
