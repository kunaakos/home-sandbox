import React from 'react'

import { useThings } from '../../hooks/use-things'

import { ThingCard } from '../thing-cards'
import { CenteredCardContainer } from '../ui-kit/cards'

export const ThingsView = () => {

	const { connected, things, setThing } = useThings()

	const visibleThings = connected && things
		? Object
			.values(things)
			.filter(thing => !thing.hidden)
		: []

	return (
		<CenteredCardContainer>
			{visibleThings.map(thing => <ThingCard key={thing.id} thing={thing} setThing={setThing} />)}
		</CenteredCardContainer>
	)

}
