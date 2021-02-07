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
			permissions
		}
		users {
			id
			displayName
			permissions
		}
	}
`

const REMOVE_USER_MUTATION = gql`
	mutation RemoveUser($id: ID!) {
		removeUser(id: $id)
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
	const removeUser = id => async () => {
		try {
			await removeUserMutation({ variables: { id }})
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
			{!loading && !error && users.map(user => <UserCard key={user.id} user={user} currentUser={currentUser} removeUser={removeUser(user.id)}/>)}
		</CenteredCardContainer>
	)

}
