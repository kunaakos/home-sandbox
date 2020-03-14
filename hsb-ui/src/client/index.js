import React from 'react'
import ReactDOM from 'react-dom'

import { ThemeProvider } from 'emotion-theming'
import { lightTheme } from './themes/light-theme'

import {
	ThingsProvider,
	useThings
} from '../components/use-things'
import { useUserToken } from '../components/use-user-token'

import { ThingCard } from '../components/thing-cards'

const App = () => {

	useUserToken()
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
