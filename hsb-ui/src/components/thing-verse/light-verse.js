import styled from '@emotion/styled'
import React from 'react'
import { useState } from 'react'

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

const ColorSwatchContainer = styled.div`
	display: flex;
	position: absolute;
	width: ${({ width = '100%' }) => width};
	height: ${({ height = '1rem' }) => height};
	margin-bottom: ${({ height }) => `-${height}`};
`

const ColorSwatch = styled.div`
	background-color: #${({ color = 'transparent' }) => color};
	flex-grow: 1;
`
// TODO: CSS gradient, but not at this hour
const ColorSwatches = ({
	width,
	height,
	colors,
}) =>
	<ColorSwatchContainer width={width} height={height}>
		{colors.map(color => <ColorSwatch color={color}/>)}
	</ColorSwatchContainer>

export const LightVerse = ({ thing, setThing }) => {

	const showBrightnessSlider = thing.state.isDimmable
	const showColorTemperatureSlider = Boolean(thing.state.colorTemperatureRange)
	const showColorSlider = thing.state.isColor

	const [availableColors, /* fix when colors need to change */] = useState(
		showColorSlider
			? JSON.parse(thing.state.availableColors)
			: []
	)

	const setIsOn = isOn => { setThing(thing.id, { isOn }) }
	const setBrightness = brightness => { setThing(thing.id, { brightness }) }
	const setColorTemperature = colorTemperature => { setThing(thing.id, { colorTemperature }) }
	
	// yea, everything related to light color is hacky
	const setColor = colorCodeindex => { setThing(thing.id, { color: availableColors[colorCodeindex] }) }
	const currentColorIndex = availableColors.findIndex(color => color === thing.state.color)

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
								width='100%'
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
								width='100%'
								value={thing.state.colorTemperature}
								onChange={setColorTemperature}
							/>
						</Arrange>
					</>}
					{showColorSlider && <>
						<Arrange height={1} horizontally='space-between' vertically='bottom'>
							<SmallLabel>color</SmallLabel>
							{availableColors && availableColors.length &&
								<ColorSwatches
									width='100%'
									height='6px'
									colors={availableColors}
								/>
							}
						</Arrange>
						<ShortStripe/>
						<Arrange height={1}vertically='top' horizontally='right'>
							<Slider
								min={0}
								max={availableColors.length - 1}
								width='100%'
								value={currentColorIndex}
								onChange={setColor}
							/>
						</Arrange>
					</>}
				</Indent>
			}

		</Verse>
	)
}
