import React from 'react'

export const UnsupportedThingCard = ({ thing }) => (
	<div>
		<h3>⁉️ {thing.label}</h3>
		<p>I'm not familiar with this thing 😕</p>
	</div>
)
