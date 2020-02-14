import * as React from 'react'
import ReactDOM from 'react-dom'

import {
	useState
} from 'react'

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
					? (<button onClick={() => { setThing(thing.id, { state: false }) }}>switch it off</button>)
					: (<button href="#" onClick={() => { setThing(thing.id, { state: true }) }}>turn it on</button>)
			} for you.
		</p>
	</div>
)

const Thermostat = ({ thing, setThing }) => {

	const setTargetTemperature = value  => {
		setThing(thing.id, {
			targetTemperature: value
		})
	}
	return (
		<div>
			<h3>🌡 {thing.label}</h3>
			<p>
				It's currently at {thing.currentTemperature} °C and it's set to keep {thing.targetTemperature} °C. The heat should currently be {thing.heatRequest ? 'on ✅' : 'off ❌'}.<br />
				Do you need it to be a bit <button onClick={() => setTargetTemperature(thing.targetTemperature + 0.5)}>warmer</button> or <button onClick={() => setTargetTemperature(thing.targetTemperature - 0.5)}>cooler</button>?<br />
		</p>
		</div>
	)
}

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
			<p>
				I am currently {connected ? 'connected' : 'not connected'} {connected ? '😌' : '😞'}.<br />
				{connected && <React.Fragment>I have a list of things that I can see in your home, let me know if you want me to do anything with them.</React.Fragment>}
			</p>
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
