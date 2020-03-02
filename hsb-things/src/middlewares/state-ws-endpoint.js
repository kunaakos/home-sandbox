import { logger } from '../logger'

export const makeStateWsEndpoint = ({
	things,
	subscribeToChanges,
	unsubscribeFromChanges
}) => (ws, req) => {

	logger.trace(`opened websocket connection, token valid for another ${req.userTokenExpiresInSeconds} seconds`)

	setTimeout(
		() => {
			logger.trace('user token expiring, closing websocket connection')
			ws.close(1000, 'user token expiring')
		},
		req.userTokenExpiresInSeconds * 1000
	)

	const messageHandler = messageString => {

		try {
			const message = JSON.parse(messageString)
			logger.trace(`received websocket message with command '${message.type}'`)

			switch (message.type) {

				case 'set-state':
					const { id, ...values } = message.payload
					things.set(id, values)
					return

				case 'get-all':
					// TODO, FIX: things removed after a client is connected will remain visible for the client until they reconnect
					ws.send(JSON.stringify({
						type: 'things-state',
						payload: things.getAll()
					}))
					return

				default:
					throw new Error('unsupported command')

			}

		} catch (error) {
			logger.error(error, 'error processing message from client')
		}

	}

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
