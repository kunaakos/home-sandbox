import React from 'react'
import { useState } from 'react'

import JSONInput from 'react-json-editor-ajrm'
import EN_LOCALE from 'react-json-editor-ajrm/locale/en'

import { editorColors } from '../../themes/light-theme'

import {
	Card,
	CardContent,
	TitleBar
} from '../ui-kit/cards'
import {
	Button,
	CardLabel,
	CardButtons,
	Label
} from '../ui-kit/nubbins'

export const SubscriptionCard = ({ subscription, removeSubscription, activateSubscription, deactivateSubscription, saveSubscriptionMapping }) => {

	const [editedSubscriptionMapping, setEditedSubscriptionMapping] = useState(subscription.jsonMapping)
	const isConfigSaved = editedSubscriptionMapping === subscription.jsonMapping

	return (
		<Card
			data-id={subscription.id}
			background={'bg1'}
		>
			<TitleBar>
				<Label
					fullWidth
					textAlign={'start'}
					background={'bg1'}
					color={'fg1'}
				>
					{subscription.label}
				</Label>
			</TitleBar>
			<CardLabel fontSize='paragraph' textAlign='left'>status: {subscription.isActive ? 'active' : 'inactive'}</CardLabel>
			<CardLabel fontSize='paragraph' textAlign='left'>publisher id: {subscription.publisherId}</CardLabel>
			<CardLabel fontSize='paragraph' textAlign='left'>subscriber id: {subscription.subscriberId}</CardLabel>
			<CardLabel fontSize='paragraph' textAlign='left'>mapping:</CardLabel>
			<CardContent>
				<JSONInput
					placeholder={JSON.parse(subscription.jsonMapping)}
					locale={EN_LOCALE}
					colors={editorColors}
					width="100%"
					height="200px"
					onChange={({json}) => { setEditedSubscriptionMapping(json) }}
				/>
			</CardContent>
			<CardButtons>
				<Button background={'error'} fontSize="subheading" onClick={removeSubscription}>Remove</Button>
				{!subscription.isActive && <Button background={'ok'} fontSize="subheading" onClick={activateSubscription}>Activate</Button>}
				{subscription.isActive && <Button background={'warn'} fontSize="subheading" onClick={deactivateSubscription}>Deactivate</Button>}
				<Button	
					fontSize="subheading"
					background={isConfigSaved ? 'fg1' : 'brand'}
					onClick={() => saveSubscriptionMapping(editedSubscriptionMapping)}
				>
					Save Config
				</Button>
			</CardButtons>
		</Card>
	)
}
