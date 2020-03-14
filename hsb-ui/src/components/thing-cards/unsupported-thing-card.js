import React from 'react'

import { Card } from '../ui-kit/cards'

export const UnsupportedThingCard = ({ thing }) => (
	<Card data-id={thing.id}>
		<h3>⁉️ {thing.label}</h3>
		<p>I'm not familiar with this thing 😕</p>
	</Card>
)
