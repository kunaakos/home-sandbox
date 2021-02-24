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
	mutation updateSubscription($subscriptionId: ID!, $jsonMapping: String, $isActive: Boolean) {
		updateSubscription(subscriptionId: $subscriptionId, jsonMapping: $jsonMapping, isActive: $isActive)
	}
`

const REMOVE_SUBSCRIPTION_MUTATION = gql`
	mutation removeSubscription($subscriptionId: ID!) {
		removeSubscription(subscriptionId: $subscriptionId)
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
	const updateSubscription = async ({ subscriptionId, jsonMapping, isActive }) => {
		try {
			await updateSubscriptionMutation({ variables: { subscriptionId, isActive, jsonMapping }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}
	const activateSubscription = subscriptionId => () => updateSubscription({ subscriptionId, isActive: true })
	const deactivateSubscription = subscriptionId => () => updateSubscription({ subscriptionId, isActive: false })
	const saveSubscriptionMapping = subscriptionId => jsonMapping => updateSubscription({ subscriptionId, jsonMapping })

	const [removeSubscriptionMutation] = useMutation(REMOVE_SUBSCRIPTION_MUTATION)
	const removeSubscription =  subscriptionId => async () => {
		try {
			await removeSubscriptionMutation({ variables: { subscriptionId }})
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
