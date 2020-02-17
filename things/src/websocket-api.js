import { Server as WebSocketServer } from 'ws'

const DEBUG = true

export const initializeWebsocketApi = async ({
	things,
	subscribeToChanges,
	unsubscribeFromChanges
}) => {

	DEBUG && console.log('WSAPI: initializing')

	const messageHandler = async messageString => {
		DEBUG && console.log(`WSAPI: received message`)
		try {
			const message = JSON.parse(messageString)

			if (message.type === 'set-state' && message.payload) {
				const { id, ...values } = message.payload
				await things.set(id, values)
			}

		} catch (error) {
			console.error(error)
		}
	}

	const webSocketServer = new WebSocketServer({ port: process.env.WS_API_PORT || 8080 })

	webSocketServer.on('connection', socket => {

		DEBUG && console.log('WSAPI: new connection')

		// send a list with all thing states on init, only updates will be sent after this
		// TODO, FIX: things removed after a client is connected will remain visible for the client until they reconnect
		socket.send(JSON.stringify({
			type: 'things-state',
			payload: things.getAll()
		}))

		const subscriptionId = subscribeToChanges(async ({ id }) => {
			const thingState = await things.get(id)
			socket.send(JSON.stringify({
				type: 'thing-state',
				payload: thingState
			}))
			DEBUG && console.log(`WSAPI: sent updated thing ${id} state`)
		})

		socket.on('close', () => {
			unsubscribeFromChanges(subscriptionId)
			DEBUG && console.log('WSAPI: connection closed')
		})

		socket.on('message', messageHandler)

	})
}
