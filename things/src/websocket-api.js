import { Server as WebSocketServer } from 'ws'

export const initializeWebsocketApi = ({
	logger,
	things,
	subscribeToChanges,
	unsubscribeFromChanges
}) => {

	logger.debug('WebSocket API initializing')

	const messageHandler = messageString => {
		logger.debug(`WebSocket API received message`)
		try {
			const message = JSON.parse(messageString)

			if (message.type === 'set-state' && message.payload) {
				const { id, ...values } = message.payload
				things.set(id, values)
			}

		} catch (error) {
			logger.error(error)
		}
	}

	const webSocketServer = new WebSocketServer({ port: process.env.WS_API_PORT || 8080 })

	webSocketServer.on('connection', (socket) => {

		logger.debug(`new WebSocket API connection`)

		// send a list with all thing states on init, only updates will be sent after this
		// TODO, FIX: things removed after a client is connected will remain visible for the client until they reconnect
		socket.send(JSON.stringify({
			type: 'things-state',
			payload: things.getAll()
		}))

		const subscriptionId = subscribeToChanges(({ id }) => {
			const thingState = things.get(id)
			socket.send(JSON.stringify({
				type: 'thing-state',
				payload: thingState
			}))
			logger.trace(`#${id} state sent to client via WebSocket API`)
		})

		socket.on('close', () => {
			unsubscribeFromChanges(subscriptionId)
			logger.debug(`closed WebSocket API connection`)
		})

		socket.on('message', messageHandler)

	})
}
