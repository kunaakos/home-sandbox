import React from 'react'

import { ThemeProvider } from 'emotion-theming'
import { lightTheme } from '../themes/light-theme'

import { useThings } from '../hooks/use-things'
import { useUserToken } from '../hooks/use-user-token'

import { CardContainer } from './ui-kit/cards'
import { ThingCard } from '../components/thing-cards'

export const App = () => {

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
			<CardContainer>
				{visibleThings.map(thing => <ThingCard key={thing.id} thing={thing} setThing={setThing} />)}
			</CardContainer>
		</ThemeProvider>
	)
}
