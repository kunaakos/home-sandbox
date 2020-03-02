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
const USER_TOKEN_ISSUER = 'domain.name' // TODO after dynamic dns + https sorted out
const USER_TOKEN_EXPIRY = '1m' // short token life: auth/reauth handling bugs, BRING'EM ON
const USER_TOKEN_COOKIE_NAME = 'hsb_user_token'

const userTokenFromRequestCookie = req => (req.cookies && req.cookies[USER_TOKEN_COOKIE_NAME]) || null

const freshUserTokenFromUserObject = user => jsonWebToken.sign(
	{
		user
	},
	USER_TOKEN_SECRET,
	{
		issuer: USER_TOKEN_ISSUER,
		expiresIn: USER_TOKEN_EXPIRY
	}
)

const returnCurrentUserToken = (req, res) => {
	const userToken = userTokenFromRequestCookie(req)
	res.json(jsonWebToken.decode(userToken))
}

const setFreshUserTokenCookieAndRedirect = (req, res) => {
	res
		.cookie(
			USER_TOKEN_COOKIE_NAME,
			freshUserTokenFromUserObject(req.user)
		)
		.redirect('/')
}

const returnFreshUserTokenAndCookie = (req, res) => {
	const freshUserToken = freshUserTokenFromUserObject(req.user)
	res
		.cookie(
			USER_TOKEN_COOKIE_NAME,
			freshUserToken
		)
		.json(jsonWebToken.decode(freshUserToken))
}

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
				jwtFromRequest: userTokenFromRequestCookie,
				secretOrKey: USER_TOKEN_SECRET,
				issuer: USER_TOKEN_ISSUER
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

	logger.debug('initializing app and registering routes')

	const app = express()

	app.use(
		'/login',
		authenticateWithPassword,
		setFreshUserTokenCookieAndRedirect
	)

	// NOTE the token is decoded twice during this request(once by passport and again here), because
	// I didn't see passport making them available on the req object 🤔
	app.use(
		'/api/auth/current-token',
		parseCookies,
		authenticateWithUserTokenCookie,
		returnCurrentUserToken
	)

	app.use(
		'/api/auth/renew-token',
		parseCookies,
		authenticateWithUserTokenCookie,
		returnFreshUserTokenAndCookie
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
