import { compose } from 'compose-middleware'
import jsonWebToken from 'jsonwebtoken'
import cookieParser from 'cookie-parser'

const USER_TOKEN_COOKIE_NAME = 'hsb_user_token'

const parseUserTokenFromCookie = (req, res, next) => {
	try {

		const userToken = req.cookies[USER_TOKEN_COOKIE_NAME]

		if (!userToken) {
			throw new Error('user token missing')
		}

		const { user, exp } = jsonWebToken.decode(userToken)
		const userTokenExpiresAt = parseInt(exp)
		const userTokenExpiresInSeconds = Math.floor(userTokenExpiresAt - (Date.now() / 1000))

		if (
			!user ||
			isNaN(userTokenExpiresInSeconds)
		) {
			throw new Error('could not successfully parse user token')
		}

		if (userTokenExpiresInSeconds < 1) {
			throw new Error('user token expired')
		}

		req.user = user
		req.userTokenExpiresInSeconds = userTokenExpiresInSeconds

		next()

	} catch (error) {
		next(error)
	}

}

export const getUserDataFromToken = compose([
	cookieParser(),
	parseUserTokenFromCookie
])
