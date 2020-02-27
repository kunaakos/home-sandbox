const path = require('path')
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')

const { makeLogger } = require('hsb-service-utils/build/logger')

logger = makeLogger({
	serviceName: 'ui',
	serviceColor: 'cyan',
	environment: process.env.ENV,
	forceLogLevel: process.env.LOG_LEVEL
})


try {
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

	
} catch (error) {
	logger.error(error, 'ui server error')
}
