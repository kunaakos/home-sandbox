import debounce from 'lodash/debounce'
import clamp from 'lodash/clamp'

import * as React from 'react'
import ReactDOM from 'react-dom'
import {
	useEffect,
	useRef,
	useState
} from 'react'

import {
	ThingsProvider,
	useThings
} from '../components/use-things'

const UnsupportedThing = ({ thing }) => (
	<div>
		<h3>⁉️ {thing.label}</h3>
		<p>I'm not familiar with this thing 😕</p>
	</div>
)

const Switch = ({ thing, setThing }) => (
	<div data-id={thing.id}>
		<h3>🔌 {thing.label}</h3>
		<p>
			It's {thing.isOn ? 'on ✅' : 'off ❌'}. I can {
				thing.isOn
					? (<button onClick={() => { setThing(thing.id, { isOn: false }) }}>switch it off</button>)
					: (<button href="#" onClick={() => { setThing(thing.id, { isOn: true }) }}>turn it on</button>)
			} for you.
		</p>
	</div>
)

const Light = ({ thing, setThing }) => {

	const brightnessSliderRef = useRef(null)
	const temperatureSliderRef = useRef(null)
	const colorPickerRef = useRef(null)

	useEffect(() => {
		brightnessSliderRef.current && (brightnessSliderRef.current.value = thing.brightness)
	}, [thing.brightness])

	useEffect(() => {
		temperatureSliderRef.current && (temperatureSliderRef.current.value = thing.colorTemperature)
	}, [thing.colorTemperature])

	useEffect(() => {
		colorPickerRef.current && (colorPickerRef.current.value = `#${thing.color}`)
	}, [thing.color])

	const setThingDebounced = debounce(setThing, 300)

	const showBrightnessSlider = thing.isDimmable
	const showTemperatureSlider = Boolean(thing.colorTemperatureRange)
	const showColorPicker = thing.isColor

	const numberOfControls = Number(showBrightnessSlider) + Number(showTemperatureSlider) + Number(showColorPicker)

	return (
		<div data-id={thing.id}>
			<h3>💡 {thing.label}</h3>
			<p>
				It's {thing.isOn ? 'on ✅. ' : 'off ❌. '}
				{thing.isOn
					? <React.Fragment>
						I can
							&nbsp;<button onClick={() => { setThing(thing.id, { isOn: false }) }}>switch it off</button>&nbsp;
						for you
							{numberOfControls > 0 ? ' or adjust its ' : null}
						{showBrightnessSlider && <React.Fragment>
							brightness
								&nbsp;<input
								type="range"
								min="1"
								max="100"
								defaultValue={thing.brightness}
								ref={brightnessSliderRef}
								onChange={e => { setThingDebounced(thing.id, { brightness: parseInt(e.target.value) }) }}
							/>&nbsp;
							</React.Fragment>}
						{numberOfControls > 1 ? ' and ' : null}
						{showColorPicker && <React.Fragment>
							color
								&nbsp;<input
								type="color"
								defaultValue={`#${thing.color}`}
								ref={colorPickerRef}
								onChange={e => { setThingDebounced(thing.id, { color: e.target.value.replace(/#/, '') }) }}
							/>&nbsp;
							</React.Fragment>}
						{showTemperatureSlider && <React.Fragment>
							color temperature
								&nbsp;<input
								type="range"
								min={thing.colorTemperatureRange[0]}
								max={thing.colorTemperatureRange[1]}
								defaultValue={thing.colorTemperature}
								ref={temperatureSliderRef}
								onChange={e => { setThingDebounced(thing.id, { colorTemperature: parseInt(e.target.value) }) }}
							/>&nbsp;
							</React.Fragment>}
						.
						</React.Fragment>
					: <React.Fragment>
						I can
							&nbsp;<button href="#" onClick={() => { setThing(thing.id, { isOn: true }) }}>turn it on</button>&nbsp;
						for you.
						</React.Fragment>
				}
			</p>
		</div>
	)
}

const Thermostat = ({ thing, setThing }) => {

	const [newTargetTemperature, setNewTargetTemperature] = useState(thing.targetTemperature)
	const newTargetTemperatureRef = useRef(null)

	useEffect(() => {
		newTargetTemperatureRef.current.value = thing.targetTemperature
	}, [thing.targetTemperature])

	const validateNewTargetTemperature = ({ target: { value: input } }) => {
		const parsedInput = parseFloat(input)
		if (!isNaN(parsedInput)) {
			setNewTargetTemperature(clamp(parsedInput, 0, 30))
		}
	}

	const setTargetTemperature = value => {
		setThing(thing.id, {
			targetTemperature: value
		})
	}

	return (
		<div data-id={thing.id}>
			<h3>🌡 {thing.label}</h3>
			<p>
				It's currently at {thing.currentTemperature} °C and it's set to keep {thing.targetTemperature} °C.
				<br />
				Heat should currently be {thing.heatRequest ? 'on ✅' : 'off ❌'}
				{thing.timedOut
					? <React.Fragment> because ⚠️ <strong>the thermostat did not receive a temperature update in a while</strong> ⚠️ - check your temperature sensor maybe? 🤔</React.Fragment>
					: '.'
				}
				<br />
				<br />
				Do you need it to be a bit <button onClick={() => setTargetTemperature(thing.targetTemperature + 0.5)}>warmer</button> or <button onClick={() => setTargetTemperature(thing.targetTemperature - 0.5)}>cooler</button>?
				<br />
				Or do you need me to set the temperature to&nbsp;
				<span>
					<button onClick={() => setThing(thing.id, { targetTemperature: newTargetTemperature })}>a value of your choice</button>
					&nbsp;👉
					<input
						type="number"
						min="0"
						max="30"
						value={newTargetTemperature}
						onChange={validateNewTargetTemperature}
						ref={newTargetTemperatureRef}
					/>&nbsp;°C
				</span>
			</p>
		</div>
	)
}

const Thing = ({ thing, setThing }) => {
	switch (thing.type) {
		case 'switch':
			return (<Switch thing={thing} setThing={setThing} />)
		case 'light':
			return (<Light thing={thing} setThing={setThing} />)
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
