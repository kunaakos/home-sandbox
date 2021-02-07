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
			<CardLabel fontSize='paragraph'>permissions: {user.permissions.map(permission => <span key={permission}>{permission}</span>)}</CardLabel>
			{isAdmin(currentUser) && currentUser.id !== user.id &&
				<>
					<Button background={'error'} onClick={removeUser}>Remove</Button>
				</>
			}
		</Card>
	)
}
