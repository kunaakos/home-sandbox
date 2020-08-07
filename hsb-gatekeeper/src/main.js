import waitOn from 'wait-on'
const express = require('express')
const expressJwt = require('express-jwt')

const { ApolloServer } = require('apollo-server-express')
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway')
const { createProxyMiddleware } = require('http-proxy-middleware')

const { makeLogger } = require('hsb-service-utils/build/logger')

const logger = makeLogger({
	serviceName: 'gtkpr',
	serviceColor: 'blue',
	environment: process.env.NODE_ENV,
	forceLogLevel: process.env.HSB__LOG_LEVEL
})

const USER_TOKEN_SECRET = process.env.GATEKEEPER__USER_TOKEN_SECRET

class HsbRemoteGraphQLDataSource extends RemoteGraphQLDataSource {

	// pass the user object from the token (parsed by express-jwt) to services behind the gateway
	willSendRequest({ request, context }) {
		request.http.headers.set(
			'hsb-user-json',
			context.auth && context.auth.user ? JSON.stringify(context.auth.user) : null
		)
	}

}

const FEDERATED_SERVICE_LIST = [
	{
		name: 'keymaster',
		url: 'http://localhost:4005/'
	},
	{
		name: 'things',
		url: 'http://localhost:4001'
	}
]

const main = async () => {

	logger.debug('waiting for federated services to become available...')

	await waitOn({
		resources: FEDERATED_SERVICE_LIST.map(service => service.url),
		interval: 300, // poll interval in ms, default 250ms
		simultaneous: 1, // limit to 1 connection per resource at a time
		timeout: 60000, // timeout in ms, default Infinity
		tcpTimeout: 1000, // tcp timeout in ms, default 300ms
		window: 1000, // stabilization time in ms, default 750ms
		validateStatus: status => status === 405 // ...is ok because these are not valid requests
	})

	logger.debug('federated services are up, initializing')

	const app = express()

	// grab the JWT from the Authorization header if present, and make it available on the request context
	app.use('/gql', expressJwt({
		secret: USER_TOKEN_SECRET,
		algorithms: ['HS256'],
		credentialsRequired: false,
		requestProperty: 'auth'
	}))

	// handle express-jwt errors
	app.use('/gql', (err, req, res, next) => {
		if (err.name === 'UnauthorizedError') {
			logger.trace('Invalid or expired token used with request.')
			next()
		} else {
			logger.error(err)
			res.status(500).send('Internal error.')
		}
	})

	const apolloGateway = new ApolloGateway({
		serviceList: FEDERATED_SERVICE_LIST,
		logger,
		buildService({ name, url }) {
			return new HsbRemoteGraphQLDataSource({
				url
			})
		}
	})

	const apolloServer = new ApolloServer({
		gateway: apolloGateway,
		subscriptions: false,
		logger,
		context: ({ req }) => {
			return {
				auth: req.auth || null
			}
		}
	})

	// mount the GraphQL server
	apolloServer.applyMiddleware({
		app: app,
		path: '/gql'
	})

	// proxy everything else to UI
	app.use(
		'/',
		createProxyMiddleware(
			{
				target: `${process.env.HSB__UI_URL}:${process.env.HSB__UI_PORT}`,
				logProvider: () => logger
			}
		)
	)

	app.listen(process.env.HSB__GATEKEEPER_PORT, () => {
		logger.info(`listening on port ${process.env.HSB__GATEKEEPER_PORT}`)
	})

}

const fatalErrorHandler = message => error => {
	logger.fatal(error, message)
	process.exit(1)
}

process.on('uncaughtException', fatalErrorHandler('uncaught exception'))
process.on('unhandledRejection', fatalErrorHandler('unhandled promise rejection'))
main().catch(fatalErrorHandler('application error'))
