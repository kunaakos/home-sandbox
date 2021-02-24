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

export const AddSubscriptionCard = ({ addSubscription }) => {

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
			background={'bg1'}
		>
			<TitleBar>
				<Label
					fullWidth
					textAlign={'start'}
					background={'bg1'}
					color={'fg1'}
				>
					New subscription
				</Label>
			</TitleBar>
			<CardLabel fontSize="paragraph">publisher id <input name="id-publisher" ref={publisherIdRef} /></CardLabel>
			<CardLabel fontSize="paragraph">subscriber id <input name="id-subscriber" ref={subscriberIdRef} /></CardLabel>
			<CardButtons>
				<Button fontSize="subheading" onClick={addSubscriptionClick}>Add</Button>
			</CardButtons>
		</Card>
	)
}
