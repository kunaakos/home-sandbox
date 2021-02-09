import React from 'react'

import {
	Card,
	TitleBar
} from '../ui-kit/cards'

import {
	Button,
	CardLabel,
	Label
} from '../ui-kit/nubbins'

const isAdmin = () => true

export const UserCard = ({ user, currentUser, removeUser }) => {

	return (
		<Card
			data-id={user.id}
			background={'bg1'}
		>
			<TitleBar>
				<Label
					fullWidth
					textAlign={'start'}
					background={'bg1'}
					color={'fg1'}
				>
					{user.displayName}
				</Label>
			</TitleBar>
			<CardLabel fontSize='paragraph'>privileges: {user.privileges.map(privilege => <span key={privilege}>{privilege}</span>)}</CardLabel>
			{isAdmin(currentUser) && currentUser.id !== user.id &&
				<>
					<Button background={'error'} onClick={removeUser}>Remove</Button>
				</>
			}
		</Card>
	)
}
