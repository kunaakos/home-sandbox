import { makeLogger } from 'hsb-service-utils'

export const logger = makeLogger({
	serviceName: 'things',
	serviceColor: 'magenta',
	prettyPrint: process.env.HSB__PRETTY_PRINT_LOGS,
	logLevel: process.env.HSB__LOG_LEVEL || 'warn'
})
