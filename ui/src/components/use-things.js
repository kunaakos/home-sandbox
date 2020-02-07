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

export const ThingsProvider = ({
    children
}) => {
    const [connected, setConnected]  = useState(false)
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

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8080`)
        socketRef.current  = socket
        socket.onopen = () => {
            socketRef.current = socket
            setConnected(true)
        }
        socket.onclose = () => {
            socketRef.current = null
            setConnected(false)
        }
        socket.onmessage = wsMessageHandler

        // DEBUG
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
