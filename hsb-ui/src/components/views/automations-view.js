import React from 'react'

import {
	useQuery,
	useMutation,
	gql
} from '@apollo/client'

import {
	SubscriptionCard,
	AddSubscriptionCard
} from '../automation-cards'

import { CenteredCardContainer } from '../ui-kit/cards'
import { Label } from '../ui-kit/nubbins'

const AUTOMATIONS_QUERY = gql`
	query Subscriptions {
		subscriptions{
			id
			publisherId
			subscriberId
			isActive
			jsonMapping
		}
	}
`

const ADD_SUBSCRIPTION_MUTATION = gql`
	mutation addSubscription($publisherId: ID!, $subscriberId: ID!, $jsonMapping: String!, $isActive: Boolean!) {
		addSubscription(publisherId: $publisherId, subscriberId: $subscriberId, jsonMapping: $jsonMapping, isActive: $isActive)
	}
`

const UPDATE_SUBSCRIPTION_MUTATION = gql`
	mutation updateSubscription($id: ID!, $jsonMapping: String, $isActive: Boolean) {
		updateSubscription(id: $id, jsonMapping: $jsonMapping, isActive: $isActive)
	}
`

const REMOVE_SUBSCRIPTION_MUTATION = gql`
	mutation removeSubscription($id: ID!) {
		removeSubscription(id: $id)
	}
`

export const AutomationsView = () => {

	const {
		loading,
		error,
		data: {subscriptions} = {},
		refetch
	} = useQuery(
		AUTOMATIONS_QUERY
	)

	const [addSubscriptionMutation] = useMutation(ADD_SUBSCRIPTION_MUTATION)
	const addSubscription = async ({ publisherId, subscriberId }) => {
		try {
			await addSubscriptionMutation({ variables: { publisherId, subscriberId, isActive: false, jsonMapping: "[]" }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}

	const [updateSubscriptionMutation] = useMutation(UPDATE_SUBSCRIPTION_MUTATION)
	const updateSubscription = async ({ id, jsonMapping, isActive }) => {
		try {
			await updateSubscriptionMutation({ variables: { id, isActive, jsonMapping }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}
	const activateSubscription = id => () => updateSubscription({ id, isActive: true })
	const deactivateSubscription = id => () => updateSubscription({ id, isActive: false })
	const saveSubscriptionMapping = id => jsonMapping => updateSubscription({ id, jsonMapping })

	const [removeSubscriptionMutation] = useMutation(REMOVE_SUBSCRIPTION_MUTATION)
	const removeSubscription =  id => async () => {
		try {
			await removeSubscriptionMutation({ variables: { id }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<CenteredCardContainer>
			{loading && <Label>Loading...</Label>}
			{error && <Label>Something went wrong :(</Label>}
			{!loading && !error && <>
				<Label>Subscriptions</Label>
				{subscriptions && subscriptions.map(subscription =>
					<SubscriptionCard
						key={subscription.id}
						subscription={subscription}
						removeSubscription={removeSubscription(subscription.id)}
						activateSubscription={activateSubscription(subscription.id)}
						deactivateSubscription={deactivateSubscription(subscription.id)}
						saveSubscriptionMapping={saveSubscriptionMapping(subscription.id)}
					/>
				)}
				<AddSubscriptionCard addSubscription={addSubscription} />
			</>}

		</CenteredCardContainer>
	)

}
