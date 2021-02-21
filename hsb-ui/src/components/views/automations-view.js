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
			idPublisher
			idSubscriber
			isActive
			jsonMapping
		}
	}
`

const ADD_SUBSCRIPTION_MUTATION = gql`
	mutation addSubscription($idPublisher: ID!, $idSubscriber: ID!, $jsonMapping: String!, $isActive: Boolean!) {
		addSubscription(idPublisher: $idPublisher, idSubscriber: $idSubscriber, jsonMapping: $jsonMapping, isActive: $isActive)
	}
`

const UPDATE_SUBSCRIPTION_MUTATION = gql`
	mutation updateSubscription($idSubscription: ID!, $jsonMapping: String, $isActive: Boolean) {
		updateSubscription(idSubscription: $idSubscription, jsonMapping: $jsonMapping, isActive: $isActive)
	}
`

const REMOVE_SUBSCRIPTION_MUTATION = gql`
	mutation removeSubscription($idSubscription: ID!) {
		removeSubscription(idSubscription: $idSubscription)
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
	const addSubscription = async ({ idPublisher, idSubscriber }) => {
		try {
			await addSubscriptionMutation({ variables: { idPublisher, idSubscriber, isActive: false, jsonMapping: "[]" }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}

	const [updateSubscriptionMutation] = useMutation(UPDATE_SUBSCRIPTION_MUTATION)
	const updateSubscription = async ({ idSubscription, jsonMapping, isActive }) => {
		try {
			await updateSubscriptionMutation({ variables: { idSubscription, isActive, jsonMapping }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}
	const activateSubscription = idSubscription => () => updateSubscription({ idSubscription, isActive: true })
	const deactivateSubscription = idSubscription => () => updateSubscription({ idSubscription, isActive: false })
	const saveSubscriptionMapping = idSubscription => jsonMapping => updateSubscription({ idSubscription, jsonMapping })

	const [removeSubscriptionMutation] = useMutation(REMOVE_SUBSCRIPTION_MUTATION)
	const removeSubscription =  idSubscription => async () => {
		try {
			await removeSubscriptionMutation({ variables: { idSubscription }})
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
