import React from 'react'
import {
	useState,
	useEffect
} from 'react'

import {
	Card,
	TitleBar
} from '../ui-kit/cards'

import {
	Button,
	HorizontalSlider,
	HorizontalSliderLabel
} from '../ui-kit/nubbins'

export const LightCard = ({ thing, setThing }) => {

	const [brightness, setBrightness] = useState(thing.state.brightness || 0)
	const [colorTemperature, setColorTemperature] = useState(thing.state.colorTemperature || 0)

	useEffect(() => {
		setBrightness(thing.state.brightness)
	}, [thing.state.brightness])

	useEffect(() => {
		setColorTemperature(thing.state.colorTemperature)
	}, [thing.state.colorTemperature])

	const showBrightnessSlider = thing.state.isDimmable
	const showColorTemperatureSlider = Boolean(thing.state.colorTemperatureRange)
	const showColorPicker = thing.state.isColor

	const toggle = () => { setThing(thing.id, { isOn: !thing.state.isOn }) }

	return (
		<Card
			data-id={thing.id}
			background={'bg1'}
			highlight={thing.state.isOn ? 'accent1' : 'disabled'}
		>
			<TitleBar>
				<Button
					fullWidth
					textAlign={'start'}
					onClick={toggle}
					background={'bg1'}
					color={'fg1'}
				>
					{thing.label}
				</Button>
			</TitleBar>

			{thing.state.isOn && <React.Fragment>
				{showBrightnessSlider && <React.Fragment>
					<HorizontalSliderLabel fontSize={'subheading'}>brightness</HorizontalSliderLabel>
					<HorizontalSlider
						min={1}
						max={100}
						value={brightness}
						onChange={(e, value) => {setBrightness(value)}}
						onChangeCommitted={(e, value) => { setThing(thing.id, { brightness: value }) }}
					/>
				</React.Fragment>}

				{showColorPicker && <React.Fragment></React.Fragment>}

				{showColorTemperatureSlider && <React.Fragment>
					<HorizontalSliderLabel color={'fg1'} fontSize={'subheading'}>color temperature</HorizontalSliderLabel>
					<HorizontalSlider
						min={thing.state.colorTemperatureRange[0]}
						max={thing.state.colorTemperatureRange[1]}
						value={colorTemperature}
						onChange={(e, value) => {setColorTemperature(value)}}
						onChangeCommitted={(e, value) => { setThing(thing.id, { colorTemperature: value }) }}
					/>
				</React.Fragment>}

			</React.Fragment>}
		</Card>
	)
}
