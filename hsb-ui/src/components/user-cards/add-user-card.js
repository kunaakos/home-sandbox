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

export const AddUserCard = ({ addUser }) => {

	const displayNameRef = useRef(null)

	const addUserClick = () => {
		addUser && addUser({
			displayName: displayNameRef.current.value,
		})
		displayNameRef.current.value = ''
	}

	return (
		<Card
			background='fg1'
		>
			<TitleBar>
				<Label
					fullWidth
					textAlign='start'
					background='fg1'
					color='bg1'
				>
					New user
				</Label>
			</TitleBar>
			<CardLabel fontSize='paragraph' textAlign='left' color= 'bg1'>Display Name <input name='displayName'  autoComplete='off' ref={displayNameRef} /></CardLabel>
			<CardButtons>
				<Button fontSize='subheading' onClick={addUserClick}>Add</Button>
			</CardButtons>
		</Card>
	)
}
