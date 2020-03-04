const path = require('path')
const express = require('express')

const { makeLogger } = require('hsb-service-utils/build/logger')

logger = makeLogger({
	serviceName: 'ui',
	serviceColor: 'cyan',
	environment: process.env.NODE_ENV,
	forceLogLevel: process.env.HSB__LOG_LEVEL
})

const main = async () => {

	const serveSinglePageApp = express.static(path.join(__dirname, '../../build/client'))

	const app = express()

	app.use(
		'/',
		serveSinglePageApp
	)

	app.listen(process.env.HSB__UI_PORT, () => {
		logger.info(`App listening on port ${process.env.HSB__UI_PORT}.`)
	})

}

const fatalErrorHandler = message => error => {
	logger.fatal(error, message)
	process.exit(1)
}

process.on('uncaughtException', fatalErrorHandler('uncaught exception'))
process.on('unhandledRejection', fatalErrorHandler('unhandled promise rejection'))
main().catch(fatalErrorHandler('application error'))
