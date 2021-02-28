import React from 'react'

import {
	useQuery,
	useMutation,
	gql
} from '@apollo/client'

import {
	VirtualThingConfigCard,
	AddVirtualThingConfigCard,
	SubscriptionCard,
	AddSubscriptionCard
} from '../automation-cards'

import { CenteredCardContainer, SectionTitleCard } from '../ui-kit/cards'
import { Label } from '../ui-kit/nubbins'

const AUTOMATIONS_QUERY = gql`
	query Automations {
		virtualThingConfigs {
			id
			type
			label
			isActive
			jsonConfig
		}
		subscriptions {
			id
			publisherId
			subscriberId
			isActive
			jsonMapping
		}
		things {
			id
			label
		}
	}
`

const ADD_VIRTUAL_THING_CONFIG_MUTATION = gql`
	mutation addVirtualThingConfig($type: String!, $label: String!, $isActive: Boolean!, $jsonConfig: String!) {
		addVirtualThingConfig(type: $type, label: $label, isActive: $isActive, jsonConfig: $jsonConfig)
	}
`

const UPDATE_VIRTUAL_THING_CONFIG_MUTATION = gql`
	mutation updateVirtualThingConfig($id: ID!, $type: String, $label: String, $isActive: Boolean, $jsonConfig: String) {
		updateVirtualThingConfig(id: $id, type: $type, label: $label, isActive: $isActive, jsonConfig: $jsonConfig)
	}
`

const REMOVE_VIRTUAL_THING_CONFIG_MUTATION = gql`
	mutation removeVirtualThingConfig($id: ID!) {
		removeVirtualThingConfig(id: $id)
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
		data: {
			virtualThingConfigs,
			subscriptions,
			things
		} = {},
		refetch
	} = useQuery(
		AUTOMATIONS_QUERY,
		{
			pollInterval: 1000
		}
	)

	const [addVirtualThingConfigMutation] = useMutation(ADD_VIRTUAL_THING_CONFIG_MUTATION)
	const addVirtualThingConfig = async ({ type, label }) => {
		try {
			await addVirtualThingConfigMutation({ variables: { type, label, isActive: false, jsonConfig: "{}" }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}

	const [updateVirtualThingConfigMutation] = useMutation(UPDATE_VIRTUAL_THING_CONFIG_MUTATION)
	const updateVirtualThingConfig = async ({ id, type, label, isActive, jsonConfig }) => {
		try {
			await updateVirtualThingConfigMutation({ variables: { id, type, label, isActive, jsonConfig }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}
	const activateVirtualThing = id => () => updateVirtualThingConfig({ id, isActive: true })
	const deactivateVirtualThing = id => () => updateVirtualThingConfig({ id, isActive: false })
	const saveVirtualThingConfig = id => jsonConfig => updateVirtualThingConfig({ id, jsonConfig })

	const [removeVirtualThingConfigMutation] = useMutation(REMOVE_VIRTUAL_THING_CONFIG_MUTATION)
	const removeVirtualThingConfig = id => async () => {
		try {
			await removeVirtualThingConfigMutation({ variables: { id }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}

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

	const thingLabels = things && things.reduce((thingLabels, {id, label}) => ({
		...thingLabels,
		[id]: label
	}), {})

	return (
		<CenteredCardContainer>
			{loading && <Label>Loading...</Label>}
			{error && <Label>Something went wrong :(</Label>}
			{!loading && !error && <>

				<SectionTitleCard>Virtual Things</SectionTitleCard>
				{virtualThingConfigs && virtualThingConfigs.map(virtualThingConfig =>
					<VirtualThingConfigCard
						key={virtualThingConfig.id}
						virtualThingConfig={virtualThingConfig}
						removeVirtualThingConfig={removeVirtualThingConfig(virtualThingConfig.id)}
						activateVirtualThing={activateVirtualThing(virtualThingConfig.id)}
						deactivateVirtualThing={deactivateVirtualThing(virtualThingConfig.id)}
						saveVirtualThingConfig={saveVirtualThingConfig(virtualThingConfig.id)}
					/>
				)}
				<AddVirtualThingConfigCard addVirtualThingConfig={addVirtualThingConfig} />

				<SectionTitleCard>Subscriptions</SectionTitleCard>
				{subscriptions && subscriptions.map(subscription =>
					<SubscriptionCard
						key={subscription.id}
						subscription={subscription}
						publisherLabel={thingLabels[subscription.publisherId]}
						subscriberLabel={thingLabels[subscription.subscriberId]}
						removeSubscription={removeSubscription(subscription.id)}
						activateSubscription={activateSubscription(subscription.id)}
						deactivateSubscription={deactivateSubscription(subscription.id)}
						saveSubscriptionMapping={saveSubscriptionMapping(subscription.id)}
					/>
				)}
				<AddSubscriptionCard addSubscription={addSubscription} things={things} />

			</>}

		</CenteredCardContainer>
	)

}
