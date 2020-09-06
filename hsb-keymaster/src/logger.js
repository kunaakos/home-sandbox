import { makeLogger } from 'hsb-service-utils/build/logger'

export const logger = makeLogger({
	serviceName: 'kymstr',
	serviceColor: 'yellow',
	prettyPrint: process.env.HSB__PRETTY_PRINT_LOGS,
	logLevel: process.env.HSB__LOG_LEVEL || 'warn'
})
