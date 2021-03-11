import React from 'react'

import {
	Verse,
	Label,
	SmallLabel,
	Highlight,
	Stripe,
	ShortStripe,
	Arrange,
	Indent,
	Switch,
	Slider
} from '../../wired'

export const LightVerse = ({ thing, setThing }) => {

	const showBrightnessSlider = thing.state.isDimmable
	const showColorTemperatureSlider = Boolean(thing.state.colorTemperatureRange)
	// const showColorPicker = thing.state.isColor

	const setIsOn = isOn => { setThing(thing.id, { isOn }) }
	const setBrightness = brightness => { setThing(thing.id, { brightness }) }
	const setColorTemperature = colorTemperature => { setThing(thing.id, { colorTemperature }) }

	return (

		<Verse
			data-id={thing.id}
		>
			<Label>{thing.label}</Label>
			<Stripe/>
			<Arrange height={1} vertically='top' horizontally='right'>
				<Switch
					isOn={thing.state.isOn}
					onChange={state => setIsOn(state)}
				/>
			</Arrange>
			
			{thing.state.isOn &&
				<Indent>
					{showBrightnessSlider && <>
						<SmallLabel>
							brightness <Highlight color='output'>{Math.round(thing.state.brightness)}%</Highlight>
						</SmallLabel>
						<ShortStripe/>
						<Arrange height={1}vertically='top' horizontally='right'>
							<Slider
								min={1}
								max={100}
								width='50%'
								value={thing.state.brightness}
								onChange={setBrightness}
							/>
						</Arrange>
					</>}
					{showColorTemperatureSlider && <>
						<SmallLabel>
							color temp. <Highlight color='output'>{Math.round(thing.state.colorTemperature)}K</Highlight>
						</SmallLabel>
						<ShortStripe/>
						<Arrange height={1}vertically='top' horizontally='right'>
							<Slider
								min={3200}
								max={4800}
								width='50%'
								value={thing.state.colorTemperature}
								onChange={setColorTemperature}
							/>
						</Arrange>
					</>}
				</Indent>
			}

		</Verse>
	)
}
