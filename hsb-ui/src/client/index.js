import React from 'react'
import ReactDOM from 'react-dom'
import {
	useEffect
} from 'react'

import { ThemeProvider } from 'emotion-theming'
import { lightTheme } from './themes/light-theme'

import {
	ThingsProvider,
	useThings
} from '../components/use-things'

import { ThingCard } from '../components/thing-cards'

const THREE_SECONDS = 1000 * 3

const fetchCurrentToken = () => 
	fetch('/api/auth/current-token')
		.then(response => response.json())

const fetchNewToken = () =>
	fetch('/api/auth/renew-token')
		.then(response => response.json())

const keepTokenUpdated = token => {

	try {
		const userTokenExpiresInMs = Math.floor(token.exp - (Date.now() / 1000)) * 1000
		const fetchNewTokenInMs = userTokenExpiresInMs - THREE_SECONDS

		if (isNaN(fetchNewTokenInMs) || fetchNewTokenInMs <= 0) {
			throw new Error('could not parse user token')
		}

		window.setTimeout(
			() => fetchNewToken().then(keepTokenUpdated),
			fetchNewTokenInMs
		)

	} catch (error) {
		console.error(error)	
	}
	
}

const App = () => {

	useEffect(() => {
		fetchCurrentToken().then(keepTokenUpdated)
	}, [])

	const { connected, things, setThing } = useThings()

	const visibleThings = connected && things
		? Object
			.values(things)
			.filter(thing => !thing.hidden)
		: []

	return (
		<ThemeProvider theme={lightTheme}>
			<h1>O HAI</h1>
			<p>
				I am currently {connected ? 'connected' : 'not connected'} {connected ? '😌' : '😞'}.<br />
				{connected && <React.Fragment>I have a list of things that I can see in your home, let me know if you want me to do anything with them.</React.Fragment>}
			</p>
			{visibleThings.map(thing => <ThingCard key={thing.id} thing={thing} setThing={setThing} />)}
		</ThemeProvider>
	)
}

ReactDOM.render(
	<ThingsProvider>
		<App />
	</ThingsProvider>,
	document.getElementById('root')
)
