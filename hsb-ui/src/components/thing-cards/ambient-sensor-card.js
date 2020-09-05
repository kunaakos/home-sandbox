import React from 'react'

import {
	useState
} from 'react'

import {
	Card,
	TitleBar
} from '../ui-kit/cards'

import {
	Button,
	CardLabel
} from '../ui-kit/nubbins'


export const AmbientSensorCard = ({ thing, setThing }) => {

	const [collapsed, setCollapsed] = useState(true)

	const highlightColor = thing.timedOut
		? 'error'
		: thing.heatRequest ? 'accent3' : 'disabled'

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
				</Button>
			</TitleBar>

			{!collapsed && <React.Fragment>
				<CardLabel fontSize={'subheading'}>temperature: {thing.state.temperature} °C</CardLabel>
				<CardLabel fontSize={'subheading'}>humidity: {thing.state.humidity} %</CardLabel>
				<CardLabel fontSize={'subheading'}>illuminance: {thing.state.illuminance} Lux</CardLabel>
				<CardLabel fontSize={'subheading'}>moisture: {thing.state.moisture} ?</CardLabel>
				<CardLabel fontSize={'subheading'}>fertility: {thing.state.fertility} ?</CardLabel>
			</React.Fragment>}
		</Card>
	)
}
