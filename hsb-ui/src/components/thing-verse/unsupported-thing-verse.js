import React from 'react'

import {
	Verse,
	Label,
	Stripe,
} from '../../wired'

export const UnsupportedThingVerse = ({ thing }) =>
	<Verse data-id={thing.id} dimmed>
		<Label>unsupported thing</Label>
		<Stripe/>
	</Verse>
