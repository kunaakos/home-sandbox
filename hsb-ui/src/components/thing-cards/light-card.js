import React from 'react'
import {
	useEffect,
	useRef
} from 'react'

import debounce from 'lodash/debounce'

import { Card } from '../ui-kit/cards'

export const LightCard = ({ thing, setThing }) => {

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
		<Card data-id={thing.id}>
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
		</Card>
	)
}
