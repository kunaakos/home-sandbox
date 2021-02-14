import React from 'react'

import {
	Card,
	TitleBar
} from '../ui-kit/cards'

import {
	Button,
	CardLabel,
	CardButtons,
	Label
} from '../ui-kit/nubbins'

const isAdmin = () => true

const getOnboardingLink = idUser => window 
	? `${window.location.protocol}//${window.location.hostname}/onboarding/${idUser}`
	: `/onboarding/${idUser}`

export const UserCard = ({ user, currentUser, removeUser, deactivateUser, activateUser }) => {

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
					{
						currentUser.id === user.id
							? 'It\'s me!'
							: user.displayName
					}
				</Label>
			</TitleBar>
			<CardLabel fontSize='paragraph'>privileges: {user.privileges.map(privilege => <span key={privilege}>{privilege}</span>)}</CardLabel>
			<CardLabel fontSize='paragraph'>status: {user.status}</CardLabel>
			{user.status === 'onboarding' && <CardLabel fullWidth fontSize='paragraph'><textarea style={{width: "calc(100% - 2rem)"}}defaultValue={getOnboardingLink(user.id)}/> </CardLabel>}
			{isAdmin(currentUser) && currentUser.id !== user.id &&
				<CardButtons>
					<Button background={'error'} fontSize="subheading" onClick={removeUser}>Remove</Button>
					{user.status === 'inactive' && <Button background={'ok'} fontSize="subheading" onClick={activateUser}>Activate</Button>}
					{user.status === 'active' && <Button background={'warn'} fontSize="subheading" onClick={deactivateUser}>Deactivate</Button>}
				</CardButtons>
			}
		</Card>
	)
}
