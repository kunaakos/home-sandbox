import express from 'express'
import expressWs from 'express-ws'

import { makeStateWsEndpointMiddleware } from './middlewares/state-ws-endpoint'

export const initializeApiServer = ({
	things,
	subscribeToChanges,
	unsubscribeFromChanges
}) => {

	const app = express()
	expressWs(app)

	app.ws(
		'/api/things/state',
		makeStateWsEndpointMiddleware({
			things,
			subscribeToChanges,
			unsubscribeFromChanges
		})

	)

	app.listen(process.env.THINGS_PORT)

}
