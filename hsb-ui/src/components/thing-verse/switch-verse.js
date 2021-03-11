import React from 'react'

import {
	Verse,
	Label,
	Stripe,
	Arrange,
	Switch
} from '../../wired'

export const SwitchVerse = ({ thing, setThing }) => {

	const setIsOn = isOn => { setThing(thing.id, { isOn }) }

	return (
		<Verse
			data-id={thing.id}
		>
			<Label>{thing.label}</Label>
			<Stripe/>
			<Arrange vertically='top' horizontally='right'>
				<Switch state={thing.state.isOn} onChange={state => setIsOn(state)}/>
			</Arrange>
		</Verse>
	)
}
