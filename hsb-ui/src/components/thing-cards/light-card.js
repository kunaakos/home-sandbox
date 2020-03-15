import React from 'react'

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

	const showBrightnessSlider = thing.isDimmable
	const showTemperatureSlider = Boolean(thing.colorTemperatureRange)
	const showColorPicker = thing.isColor

	const toggle = () => { setThing(thing.id, { isOn: !thing.isOn }) }

	return (
		<Card
			data-id={thing.id}
			background={'bg1'}
			highlight={thing.isOn ? 'accent1' : 'disabled'}
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

			{thing.isOn && <React.Fragment>
				{showBrightnessSlider && <React.Fragment>
					<HorizontalSliderLabel fontSize={'subheading'}>brightness</HorizontalSliderLabel>
					<HorizontalSlider
						min={1}
						max={100}
						value={thing.brightness}
						onChangeCommitted={(e, value) => { setThing(thing.id, { brightness: value }) }}
					/>
				</React.Fragment>}

				{showColorPicker && <React.Fragment></React.Fragment>}

				{showTemperatureSlider && <React.Fragment>
					<HorizontalSliderLabel color={'fg1'} fontSize={'subheading'}>color temperature</HorizontalSliderLabel>
					<HorizontalSlider
						min={thing.colorTemperatureRange[0]}
						max={thing.colorTemperatureRange[1]}
						value={thing.colorTemperature}
						onChangeCommitted={(e, value) => { setThing(thing.id, { colorTemperature: value }) }}
					/>
				</React.Fragment>}

			</React.Fragment>}
		</Card>
	)
}
