const path = require('path')
const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const { BasicStrategy } = require('passport-http')
const { Strategy: JwtStrategy } = require('passport-jwt')
const jsonWebToken = require('jsonwebtoken')

const { makeLogger } = require('hsb-service-utils/build/logger')

logger = makeLogger({
	serviceName: 'ui',
	serviceColor: 'cyan',
	environment: process.env.NODE_ENV,
	forceLogLevel: process.env.LOG_LEVEL
})

const USER_TOKEN_SECRET = process.env.USER_TOKEN_SECRET
const USER_TOKEN_COOKIE_NAME = 'hsb_user_token'

const main = async () => {

	logger.debug('configuring authentication stategies')

	passport.use(
		new BasicStrategy(
			(username, password, done) => {
				if (
					username === 'mario' &&
					password === 'wario'
				) {
					done(null, { _id: 'its-a-me' })
				} else {
					done(null, false)
				}
			}
		)
	)

	passport.use(
		new JwtStrategy(
			{
				jwtFromRequest: req => (req.cookies && req.cookies[USER_TOKEN_COOKIE_NAME]) || null,
				secretOrKey: USER_TOKEN_SECRET,
				issuer: 'remelem.online'
			},
			(userTokenPayload, done) => {
				const { user } = userTokenPayload
				done(null, user)
			}
		)
	)

	logger.debug('initializing middleware')

	const parseCookies = cookieParser()
	const serveSinglePageApp = express.static(path.join(__dirname, '../../build/client'))

	const authenticateWithUserTokenCookie = passport.authenticate(
		'jwt',
		{
			session: false,
			failureRedirect: '/login'
		}
	)
	const authenticateWithPassword = passport.authenticate(
		'basic',
		{
			session: false
		}
	)

	const proxyThingsApi = createProxyMiddleware(
		{
			target: process.env.THINGS_URL,
			ws: true,
			logProvider: () => logger
		}
	)

	const setUserTokenCookie = (req, res) => {
		res
			.cookie(
				USER_TOKEN_COOKIE_NAME,
				jsonWebToken.sign(
					{
						user: req.user
					},
					USER_TOKEN_SECRET,
					{
						issuer: 'remelem.online',
						expiresIn: '5m'
					}
				)
			)
			.redirect('/')
	}

	logger.debug('initializing app and registering routes')

	const app = express()

	app.use(
		'/login',
		authenticateWithPassword,
		setUserTokenCookie
	)

	app.use(
		'/api/things',
		parseCookies,
		authenticateWithUserTokenCookie,
		proxyThingsApi
	)

	app.use(
		'/',
		parseCookies,
		authenticateWithUserTokenCookie,
		serveSinglePageApp
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
