import React from 'react'

import {
	useQuery,
	gql
} from '@apollo/client'

import { UserCard } from '../user-card'
import { CenteredCardContainer } from '../ui-kit/cards'
import { Label } from '../ui-kit/nubbins'

const USERS_QUERY = gql`
	query Users {
		users {
			id
			username
			displayName
			permissions
		}
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

	const users = !loading && !error
		? data.users
		: []

	return (
		<CenteredCardContainer>
			{loading && <Label>Loading...</Label>}
			{error && <Label>Something went wrong :(</Label>}
			{!loading && !error && users.map(user => <UserCard key={user.id} user={user} />)}
		</CenteredCardContainer>
	)

}
