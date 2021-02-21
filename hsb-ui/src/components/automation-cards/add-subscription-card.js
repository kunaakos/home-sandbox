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

	const idPublisherRef = useRef(null)
	const idSubscriberRef = useRef(null)

	const addSubscriptionClick = () => {
		addSubscription && addSubscription({
			idPublisher: idPublisherRef.current.value,
			idSubscriber: idSubscriberRef.current.value,
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
			<CardLabel fontSize="paragraph">publisher id <input name="id-publisher" ref={idPublisherRef} /></CardLabel>
			<CardLabel fontSize="paragraph">subscriber id <input name="id-subscriber" ref={idSubscriberRef} /></CardLabel>
			<CardButtons>
				<Button fontSize="subheading" onClick={addSubscriptionClick}>Add</Button>
			</CardButtons>
		</Card>
	)
}
