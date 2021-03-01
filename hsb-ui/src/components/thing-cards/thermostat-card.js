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
	HorizontalSliderLabel,
	HorizontalSlider,
	Button
} from '../ui-kit/nubbins'

export const ThermostatCard = ({ thing, setThing }) => {

	const [collapsed, setCollapsed] = useState(true)
	const [targetTemperature, setTargetTemperature ] = useState(thing.state.targetTemperature)

	useEffect(() => {
		setTargetTemperature(thing.state.targetTemperature)
	}, [thing.state.targetTemperature])

	const highlightColor = thing.state.timedOut
		? 'error'
		: thing.state.heatRequest ? 'accent3' : 'disabled'

	return (
		<Card
			data-id={thing.id}
			background={'bg1'}
			highlight={highlightColor}
		>
			<TitleBar>
				<Button
					onClick={() => setCollapsed(!collapsed)}
					fullWidth
					textAlign={'start'}
					background={'bg1'}
					color={'fg1'}
				>
					{thing.label}
					<span css={theme => ({ color: theme.colors.disabled })}> &nbsp;{thing.state.currentTemperature} °C</span>
				</Button>
			</TitleBar>

			{!collapsed && <React.Fragment>
				<HorizontalSliderLabel fontSize={'subheading'}>
					target temperature {targetTemperature} °C
				</HorizontalSliderLabel>
				<HorizontalSlider
					min={0}
					max={30}
					step={0.1}
					value={targetTemperature}
					onChange={(e, value) => { setTargetTemperature(value) }}
					onChangeCommitted={(e, value) => { setThing(thing.id, { targetTemperature: value }) }}
				/>
			</React.Fragment>}
		</Card>
	)
}
