import React from 'react'
import { useState } from 'react'

import JSONInput from 'react-json-editor-ajrm'
import EN_LOCALE from 'react-json-editor-ajrm/locale/en'

import { editorColors } from '../../themes/wired-dark'

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

export const GatewayCard = ({ gateway, removeGateway, activateGateway, deactivateGateway, saveGatewayConfig }) => {

	const [editedJsonConfig, setEditedJsonConfig] = useState(gateway.jsonConfig)
	const isConfigSaved = editedJsonConfig === gateway.jsonConfig

	return (
		<Card
			data-id={gateway.id}
			background='bg1'
		>
			<TitleBar>
				<Label
					fullWidth
					textAlign='start'
					background='bg1'
					color='fg1'
				>
					{gateway.label}
				</Label>
			</TitleBar>
			<CardLabel fontSize='paragraph'>type: {gateway.type}</CardLabel>
			<CardLabel fontSize='paragraph'>config:</CardLabel>
			<CardContent>
				<JSONInput
					placeholder={JSON.parse(gateway.jsonConfig)}
					reset={false}
					locale={EN_LOCALE}
					colors={editorColors}
					width='100%'
					height='300px'
					onChange={({json}) => { setEditedJsonConfig(json) }}
				/>
			</CardContent>
			<CardButtons>
				<Button background='error' fontSize='subheading' onClick={removeGateway}>Remove</Button>
				{!gateway.isActive && <Button background='ok' fontSize='subheading' onClick={activateGateway}>Activate</Button>}
				{gateway.isActive && <Button background='warn' fontSize='subheading' onClick={deactivateGateway}>Deactivate</Button>}
				<Button	
					fontSize='subheading'
					background={isConfigSaved ? 'fg1' : 'brand'}
					onClick={() => saveGatewayConfig(editedJsonConfig)}
				>
					Save Config
				</Button>
			</CardButtons>
		</Card>
	)
}
