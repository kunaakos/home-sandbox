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

const UNITS = {
	battery: '%',
	temperature: '°C',
	humidity: '%',
	illuminance: 'Lux',
	moisture: '',
	fertility: ''
}

export const AmbientSensorCard = ({ thing, setThing }) => {

	const [collapsed, setCollapsed] = useState(true)

	const highlightColor = 'disabled'

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
				{Object.entries(thing.state).map(
					([property, value]) => <CardLabel key={property} fontSize={'subheading'}>{property}: {value} {UNITS[property] || ''}</CardLabel>
				)}
			</React.Fragment>}
		</Card>
	)
}
