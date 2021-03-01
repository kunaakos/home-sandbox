import React from 'react'

import {
	useQuery,
	useMutation,
	gql
} from '@apollo/client'

import {
	GatewayCard,
	AddGatewayCard
} from '../gateway-cards'

import { CenteredCardContainer } from '../ui-kit/cards'
import { Label } from '../ui-kit/nubbins'

const GATEWAYS_QUERY = gql`
	query Gateways {
		gateways{
			id
			type
			label
			isActive
			jsonConfig
		}
	}
`

const ADD_GATEWAY_MUTATION = gql`
	mutation addGateway($type: String!, $label: String!, $isActive: Boolean!, $jsonConfig: String!) {
		addGateway(type: $type, label: $label, isActive: $isActive, jsonConfig: $jsonConfig)
	}
`

const UPDATE_GATEWAY_MUTATION = gql`
	mutation updateGateway($id: ID!, $type: String, $label: String, $isActive: Boolean, $jsonConfig: String) {
		updateGateway(id: $id, type: $type, label: $label, isActive: $isActive, jsonConfig: $jsonConfig)
	}
`

const REMOVE_GATEWAY_MUTATION = gql`
	mutation removeGateway($id: ID!) {
		removeGateway(id: $id)
	}
`

export const GatewaysView = () => {

	const {
		loading,
		error,
		data: {gateways} = {},
		refetch
	} = useQuery(
		GATEWAYS_QUERY,
		{
			pollInterval: 1000
		}
	)

	const [addGatewayMutation] = useMutation(ADD_GATEWAY_MUTATION)
	const addGateway = async ({ type, label }) => {
		try {
			await addGatewayMutation({ variables: { type, label, isActive: false, jsonConfig: "{}" }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}

	const [updateGatewayMutation] = useMutation(UPDATE_GATEWAY_MUTATION)
	const updateGateway = async ({ id, type, label, isActive, jsonConfig }) => {
		try {
			await updateGatewayMutation({ variables: { id, type, label, isActive, jsonConfig }})
			refetch()
		} catch (error) {
			console.error(error)
		}
	}
	const activateGateway = id => () => updateGateway({ id, isActive: true })
	const deactivateGateway = id => () => updateGateway({ id, isActive: false })
	const saveGatewayConfig = id => jsonConfig => updateGateway({ id, jsonConfig })

	const [removeGatewayMutation] = useMutation(REMOVE_GATEWAY_MUTATION)
	const removeGateway = id => async () => {
		try {
			await removeGatewayMutation({ variables: { id }})
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
				{gateways && gateways.map(gateway =>
					<GatewayCard
						key={gateway.id}
						gateway={gateway}
						removeGateway={removeGateway(gateway.id)}
						activateGateway={activateGateway(gateway.id)}
						deactivateGateway={deactivateGateway(gateway.id)}
						saveGatewayConfig={saveGatewayConfig(gateway.id)}
					/>
				)}
				<AddGatewayCard addGateway={addGateway} />
			</>}

		</CenteredCardContainer>
	)

}
