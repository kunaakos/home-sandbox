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

export const UserCard = ({ user }) => {

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
			<CardLabel fontSize='paragraph'>username: {user.username}</CardLabel>
			<CardLabel fontSize='paragraph'>permissions: {user.permissions.map(permission => <span>{permission}</span>)}</CardLabel>
		</Card>
	)
}
