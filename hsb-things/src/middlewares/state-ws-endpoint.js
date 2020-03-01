import { logger } from '../logger'

export const makeStateWsEndpoint = ({
	things,
	subscribeToChanges,
	unsubscribeFromChanges
}) => (ws, req) => {

	logger.trace('opened websocket connection')

	setTimeout(
		() => {
			logger.trace('user token expired, terminating websocket connection')
			ws.terminate()
		},
		req.userTokenExpiresInSeconds * 1000
	)

	const messageHandler = messageString => {

		logger.trace(`received websocket message`)

		try {
			const message = JSON.parse(messageString)

			if (message.type === 'set-state' && message.payload) {
				const { id, ...values } = message.payload
				things.set(id, values)
			}

		} catch (error) {
			logger.error(error, 'error processing message from client')
		}

	}

	// send a list with all thing states on init, only updates will be sent after this
	// TODO, FIX: things removed after a client is connected will remain visible for the client until they reconnect
	ws.send(JSON.stringify({
		type: 'things-state',
		payload: things.getAll()
	}))

	const subscriptionId = subscribeToChanges(({ id }) => {
		const thingState = things.get(id)
		ws.send(JSON.stringify({
			type: 'thing-state',
			payload: thingState
		}))
		logger.trace(`#${id} state sent to client via websocket connection`)
	})

	ws.on('close', () => {
		unsubscribeFromChanges(subscriptionId)
		logger.trace(`closed websocket connection`)
	})

	ws.on('message', messageHandler)

}
