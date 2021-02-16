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

export const AddGatewayCard = ({ addGateway }) => {

	const typeRef = useRef(null)
	const labelRef = useRef(null)

	const addGatewayClick = () => {
		addGateway && addGateway({
			type: typeRef.current.value,
			label: labelRef.current.value,
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
					New gateway
				</Label>
			</TitleBar>
			<CardLabel fontSize="paragraph">type <input name="type" ref={typeRef} /></CardLabel>
			<CardLabel fontSize="paragraph">label <input name="label" ref={labelRef} /></CardLabel>
			<CardButtons>
				<Button fontSize="subheading" onClick={addGatewayClick}>Add</Button>
			</CardButtons>
		</Card>
	)
}