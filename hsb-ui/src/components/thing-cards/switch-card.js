import React from 'react'

import {
	Card,
	TitleBar
} from '../ui-kit/cards'

import {
	Button
} from '../ui-kit/nubbins'

export const SwitchCard = ({ thing, setThing }) => {

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
		</Card>
	)
}
