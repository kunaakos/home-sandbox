import * as React from 'react'
import ReactDOM from 'react-dom'

import {
	ThingsProvider,
	useThings
} from './components/use-things'

const UnsupportedThing = ({ thing }) => (
	<div>
		<h3>{thing.label}</h3>
		<p>I'm not familiar with this thing 😕</p>
	</div>
)

const Switch = ({ thing, setThing }) => (
	<div>
		<h3>🔌 {thing.label}</h3>
		<p>
			It's {thing.state ? 'on ✅' : 'off ❌'}. I can {
				thing.state
					? ( <a href="#" onClick={() => { setThing(thing.id, { state: false }) }}>switch it off</a> )
					: ( <a href="#" onClick={() => { setThing(thing.id, { state: true }) }}>turn it on</a> )
			} for you.
		</p>
	</div>
)

const Thermostat = ({ thing, setThing }) => (
	<div>
		<h3>🌡 {thing.label}</h3>
		<p>
			It's currently at {thing.currentTemperature} °C and it's set to keep {thing.targetTemperature} °C. The heat should be currently be {thing.heatRequest ? 'on ✅' : 'off ❌'}.<br/>
		</p>
	</div>
)

const Thing = ({ thing, setThing }) => {
	switch (thing.type) {
		case 'switch':
			return (<Switch thing={thing} setThing={setThing} />)
		case 'thermostat':
			return (<Thermostat thing={thing} setThing={setThing} />)
		default:
			return (<UnsupportedThing thing={thing} />)
	}
}


const App = () => {

	const { connected, things, setThing } = useThings()

	const visibleThings = connected && things
		? Object
			.values(things)
			.filter(thing => !thing.hidden)
		: []

	return (
		<React.Fragment>
			<h1>O HAI</h1>
			<p>I'm your butler. I am currently {connected ? 'connected' : 'not connected'} to your home {connected ? '😌' : '😞'}.<br/>{connected && 'I have a list of things that I can see in your home, let me know if you want me to do anything with them.'}</p>
			{visibleThings.map(thing => <Thing key={thing.id} thing={thing} setThing={setThing} />)}
		</React.Fragment>
	)
}

ReactDOM.render(
	<ThingsProvider>
		<App />
	</ThingsProvider>,
	document.getElementById('root')
)
