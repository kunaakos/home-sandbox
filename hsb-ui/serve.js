const path = require('path')
const express = require('express')

const { makeLogger } = require('hsb-service-utils/build/logger')

logger = makeLogger({
	serviceName: 'ui',
	serviceColor: 'cyan',
	prettyPrint: process.env.HSB__PRETTY_PRINT_LOGS,
	logLevel: process.env.HSB__LOG_LEVEL || 'warn'
})

const main = async () => {

	const serveSinglePageApp = express.static(path.join(__dirname, 'build'))

	const app = express()

	app.use(
		'/',
		serveSinglePageApp
	)

	app.get(
		'*',
		(req, res) => {
			res.sendFile(path.join(__dirname, '../build/client/index.html'))
		}
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
