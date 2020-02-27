const path = require('path')
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')

const { makeLogger } = require('hsb-service-utils/build/logger')

logger = makeLogger({
	serviceName: 'ui',
	serviceColor: 'cyan',
	environment: process.env.NODE_ENV,
	forceLogLevel: process.env.LOG_LEVEL
})

const main = async () => {

	const app = express()

	app.use(
		'/wsapi',
		createProxyMiddleware('/', {
			target: process.env.THINGS_URL, ws: true,
			logProvider: () => logger
		})
	)

	app.use(
		'/',
		express.static(path.join(__dirname, '../../build/client'))
	)

	app.listen(process.env.UI_PORT, () => {
		logger.info(`App listening on port ${process.env.UI_PORT}.`)
	})

}

const fatalErrorHandler = message => error => {
	logger.fatal(error, message)
	process.exit(1)
}

process.on('uncaughtException', fatalErrorHandler('uncaught exception'))
process.on('unhandledRejection', fatalErrorHandler('unhandled promise rejection'))
main().catch(fatalErrorHandler('application error'))
