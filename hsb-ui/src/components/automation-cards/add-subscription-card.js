import React from 'react'
import {
	useRef
} from 'react'

import { 
	Card,
	TitleBar
} from '../ui-kit/cards'
import {
	Label,
	CardLabel,
	Button,
	CardButtons
} from '../ui-kit/nubbins'

export const AddSubscriptionCard = ({ addSubscription, things }) => {

	const publisherIdRef = useRef(null)
	const subscriberIdRef = useRef(null)

	const addSubscriptionClick = () => {
		addSubscription && addSubscription({
			publisherId: publisherIdRef.current.value,
			subscriberId: subscriberIdRef.current.value,
		})
	}

	return (
		<Card
			background={'fg1'}
		>
			<TitleBar>
				<Label
					fullWidth
					textAlign={'start'}
					background={'fg1'}
					color={'bg1'}
				>
					New subscription
				</Label>
			</TitleBar>
			<CardLabel fontSize='paragraph' textAlign='left' color={'bg1'}>
				publisher&nbsp;
				<select ref={publisherIdRef}>
					{things.map(thing => <option key={thing.id} value={thing.id}>{thing.label}</option>)}
				</select>
			</CardLabel>
			<CardLabel fontSize='paragraph' textAlign='left' color={'bg1'}>
				subscriber&nbsp;
				<select ref={subscriberIdRef}>
					{things.map(thing => <option key={thing.id} value={thing.id}>{thing.label}</option>)}
				</select>
			</CardLabel>
			<CardButtons>
				<Button fontSize='subheading' onClick={addSubscriptionClick}>Add</Button>
			</CardButtons>
		</Card>
	)
}
