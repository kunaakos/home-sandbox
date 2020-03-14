import React from 'react'

import {
	useEffect,
	useRef,
	useState
} from 'react'

import clamp from 'lodash/clamp'

export const ThermostatCard = ({ thing, setThing }) => {

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
