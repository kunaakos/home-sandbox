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
	console.log(addUser)

	const addUserClick = () => {
		addUser && addUser({
			displayName: displayNameRef.current.value,
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
					New user
				</Label>
			</TitleBar>
			<CardLabel fontSize="paragraph">Display Name <input name="displayName" ref={displayNameRef} /></CardLabel>
			<CardButtons>
				<Button fontSize="subheading" onClick={addUserClick}>Add</Button>
			</CardButtons>
		</Card>
	)
}
