import express from 'express'
import expressWs from 'express-ws'

import { getUserDataFromToken } from 'hsb-service-utils/build/middlewares'
import { makeStateWsEndpoint } from './middlewares/state-ws-endpoint'

export const initializeApiServer = ({
	things,
	subscribeToChanges,
	unsubscribeFromChanges
}) => {

	const app = express()
	expressWs(app)

	app.use(getUserDataFromToken)

	app.ws(
		'/api/things/state',
		makeStateWsEndpoint({
			things,
			subscribeToChanges,
			unsubscribeFromChanges
		})
	)

	app.listen(process.env.THINGS_PORT)

}
