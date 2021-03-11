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
	width: ${({ width = '100%', padding = '0' }) => `calc(${width} - ${padding} * 2)`};
	height: ${({ height = '1rem' }) => height};
	margin-bottom: ${({ theme }) => `-${theme.stripeWidthPx}px`};
	${({ padding = '0', theme }) => `border-left: ${padding} solid ${theme.colors.input}; border-right: ${padding} solid ${theme.colors.input};`}
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
	padding
}) =>
	<ColorSwatchContainer width={width} height={height} padding={padding}>
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
					{showColorSlider && <>
						<Arrange horizontally='space-between' vertically='bottom'>
							<SmallLabel>
								color <Highlight color='output'>#{thing.state.color}</Highlight>
							</SmallLabel>
							{availableColors && availableColors.length &&
								<ColorSwatches
									width='50%'
									height='6px'
									padding='1rem'
									colors={availableColors}
								/>
							}
						</Arrange>
						<ShortStripe/>
						<Arrange height={1}vertically='top' horizontally='right'>
							<Slider
								min={0}
								max={availableColors.length - 1}
								width='50%'
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
