import { Server as WebSocketServer } from 'ws'

const DEBUG = true

export const initializeWebsocketApi = async ({
	things,
	onThingStateChanged
}) => {

	DEBUG && console.log('WSAPI: initializing')
	const webSocketServer = new WebSocketServer({ port: process.env.WS_API_PORT || 8080 })

	webSocketServer.on('connection', socket => {

		DEBUG && console.log('WSAPI: new socket connection')

		socket.send(JSON.stringify({
			type: 'things-state',
			payload: things.getAll()
		}))

		socket.on('message', async messageString => {
			DEBUG && console.log(`WSAPI: received message`)
			try {
				const message  = JSON.parse(messageString)

				if (message.type === 'set-state' && message.payload) {
					const { id, ...values } = message.payload
					console.log(id, values)
					await things.set(id, values)
				}

			} catch (error) {
				console.error(error)
			}
		})

		onThingStateChanged(async ({id}) => {
			const thingState = await things.get(id)
			socket.send(JSON.stringify({
				type: 'thing-state',
				payload: thingState
			}))
			DEBUG && console.log(`WSAPI: sent updated thing ${id} state`)
		})
	})
}
