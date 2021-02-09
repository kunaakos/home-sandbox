import React from 'react'

import {
	useQuery,
	useMutation,
	gql
} from '@apollo/client'

import { UserCard } from '../user-card'
import { CenteredCardContainer } from '../ui-kit/cards'
import { Label } from '../ui-kit/nubbins'

const USERS_QUERY = gql`
	query Users {
		currentUser {
			id
			privileges
		}
		users {
			id
			displayName
			status
			privileges
		}
	}
`

const REMOVE_USER_MUTATION = gql`
	mutation RemoveUser($idUser: ID!) {
		removeUser(idUser: $idUser)
	}
`

const ACTIVATE_USER_MUTATION = gql`
	mutation ActivateUser($idUser: ID!) {
		activateUser(idUser: $idUser)
	}
`

const DEACTIVATE_USER_MUTATION = gql`
	mutation DeactivateUser($idUser: ID!) {
		deactivateUser(idUser: $idUser)
	}
`

export const UsersView = () => {

	const {
		loading,
		error,
		data,
		refetch
	} = useQuery(
		USERS_QUERY,
		{
			pollInterval: 1000,
			variables: {
				visibleOnly: true
			}
		}
	)

	const [removeUserMutation] = useMutation(REMOVE_USER_MUTATION)
	const removeUser = idUser => async () => {
		try {
			await removeUserMutation({ variables: { idUser }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}

	const [activateUserMutation] = useMutation(ACTIVATE_USER_MUTATION)
	const activateUser = idUser => async () => {
		try {
			await activateUserMutation({ variables: { idUser }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}

	const [deactivateUserMutation] = useMutation(DEACTIVATE_USER_MUTATION)
	const deactivateUser = idUser => async () => {
		try {
			await deactivateUserMutation({ variables: { idUser }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}

	const users = data && data.users
	const currentUser = data && data.currentUser

	return (
		<CenteredCardContainer>
			{loading && <Label>Loading...</Label>}
			{error && <Label>Something went wrong :(</Label>}
			{!loading && !error && users.map(user =>
				<UserCard
					key={user.id}
					user={user}
					currentUser={currentUser}
					removeUser={removeUser(user.id)}
					activateUser={activateUser(user.id)}
					deactivateUser={deactivateUser(user.id)}
				/>)}
		</CenteredCardContainer>
	)

}
