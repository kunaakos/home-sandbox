import * as React from 'react'
import {
	createContext,
	useContext,
	useState,
	useEffect,
	useRef
} from 'react'

const ThingsContext = createContext({
	connected: false,
	things: {},
	setThing: null
})

export const useThings = () => useContext(ThingsContext)

const reconnectingWebSocket = ({
	url,
	onmessage,
	onclose,
	onopen,
}) => {

	const initializeSocket = () => {
		const socket = new WebSocket(url)
		socket.onopen = () => { onopen && onopen(socket) }
		socket.onmessage = message => { onmessage && onmessage(message) }
		socket.onerror  = errorEvent => {
			onError && onError()
		}
		socket.onclose = closeEvent => {
			if (closeEvent.code === 1000) {
				initializeSocket()
			} else {
				onclose && onclose()
			}
		}
	}

	initializeSocket()

}

export const ThingsProvider = ({
	children
}) => {

	const [connected, setConnected] = useState(false)
	const [things, setThings] = useState({})
	const thingsRef = useRef(things)
	thingsRef.current = things
	const socketRef = useRef(null)

	const updateThing = thing => {
		const { id } = thing
		setThings({
			...thingsRef.current,
			[id]: thing
		})
	}

	const addThings = things => {
		const thingsObj = things.reduce((acc, thing) => {
			acc[thing.id] = thing
			return acc
		}, {})

		setThings(thingsObj)
	}

	const wsMessageHandler = ({ data: messageString }) => {
		const message = JSON.parse(messageString)

		switch (message.type) {
			case 'things-state':
				addThings(message.payload)
				break
			case 'thing-state':
				updateThing(message.payload)
				break

			default:
				console.error('unrecognized command received')
				break
		}
	}

	const setThing = (id, values) => {
		if (!socketRef.current) { return }
		socketRef.current.send(JSON.stringify({
			type: 'set-state',
			payload: {
				id,
				...values
			}
		}))
	}

	const requestAllThings = () => {
		if (!socketRef.current) { return }
		socketRef.current.send(JSON.stringify({
			type: 'get-all',
			payload: null
		}))
	}

	useEffect(() => {

		reconnectingWebSocket({
			url: `ws://${window.location.host}/api/things/state`,
			onopen: socket => {
				socketRef.current = socket
				requestAllThings()
				setConnected(true)
			},
			onclose: () => {
				socketRef.current = null
				setConnected(false)
				setThings({})
			},
			onError: () => {
				socketRef.current = null
				setConnected(false)
				setThings({})
			},
			onmessage: wsMessageHandler
		})

		// available globally for debugging and features unimplemented in the ui
		// to be used from the console, and not from any other part of the app
		window.setThing = setThing

	}, [])

	return (
		<ThingsContext.Provider
			value={{
				connected,
				things,
				setThing
			}}
		>
			{children}
		</ThingsContext.Provider>
	)
}
