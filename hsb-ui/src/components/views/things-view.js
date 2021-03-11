import React from 'react'

import {
	useQuery,
	useMutation,
	gql
} from '@apollo/client'

import { ThingVerse } from '../thing-verse'
import {
	Scroll,
	Label
} from '../../wired'

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
	mutation SetThing($id: ID!, $newValues: String!) {
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
		<Scroll>
			{
				things.length
					? things.map(thing => <ThingVerse key={thing.id} thing={thing} setThing={setThing} />)
					: <Label>You don't seem to have any active things. Check your settings maybe?</Label>
			}
		</Scroll>
	)

}
