import React from 'react'

import {
	useQuery,
	useMutation,
	gql
} from '@apollo/client'

import { ThingCard } from '../thing-cards'
import { CenteredCardContainer } from '../ui-kit/cards'
import { Label } from '../ui-kit/nubbins'

const THINGS_QUERY = gql`
	query Things($visibleOnly: Boolean) {
		things(visibleOnly: $visibleOnly) {
			type
			id
			label
			hidden
			state
		}
	}
`

const SET_THING_MUTATION = gql`
	mutation SetThing($id: String!, $newValues: String!) {
		setThing(id: $id, newValues: $newValues)
	}
`

export const ThingsView = () => {

	const {
		loading,
		error,
		data,
		refetch
	} = useQuery(
		THINGS_QUERY,
		{
			pollInterval: 400,
			variables: {
				visibleOnly: true
			}
		}
	)

	const [setThingMutation] = useMutation(SET_THING_MUTATION)

	const setThing = (id, newValues) => {
		setThingMutation({
			variables: {
				id,
				newValues: JSON.stringify(newValues)
			}
		})
			.catch(error => console.error(error))
	}

	const things = !loading && !error
		? data.things.map(thing => ({
			...thing,
			state: JSON.parse(thing.state)
		}))
		: []

	return (
		<CenteredCardContainer>
			{
				things.length
					? things.map(thing => <ThingCard key={thing.id} thing={thing} setThing={setThing} />)
					: <Label>You don't seem to have any active things. Check your settings maybe?</Label>
			}
		</CenteredCardContainer>
	)

}
