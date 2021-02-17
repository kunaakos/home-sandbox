import React from 'react'
import { useState } from 'react'

import JSONInput from 'react-json-editor-ajrm'
import EN_LOCALE from 'react-json-editor-ajrm/locale/en'

import { lightTheme } from '../../themes/light-theme'

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

const colors = lightTheme.colors
const EDITOR_COLORS = {
	default: colors.fg1,
	background: colors.bg1,
	background_warning: colors.warn,
	string: colors.neutral3,
	number: colors.neutral2,
	colon: colors.fg1,
	keys: colors.neutral1,
	keys_whiteSpace: colors.neutral2,
	primitive: colors.neutral2
}

export const GatewayCard = ({ gateway, removeGateway, activateGateway, deactivateGateway, saveGatewayConfig }) => {

	const [editedJsonConfig, setEditedJsonConfig] = useState(gateway.jsonConfig)
	const isConfigSaved = editedJsonConfig === gateway.jsonConfig

	return (
		<Card
			data-id={gateway.id}
			background={'bg1'}
		>
			<TitleBar>
				<Label
					fullWidth
					textAlign={'start'}
					background={'bg1'}
					color={'fg1'}
				>
					{gateway.label}
				</Label>
			</TitleBar>
			<CardLabel fontSize='paragraph'>status: {gateway.isActive ? 'active' : 'inactive'}</CardLabel>
			<CardLabel fontSize='paragraph'>type: {gateway.type}</CardLabel>
			<CardLabel fontSize='paragraph'>config:</CardLabel>
			<CardContent>
				<JSONInput
					placeholder={JSON.parse(gateway.jsonConfig)}
					locale={EN_LOCALE}
					colors={EDITOR_COLORS}
					width="100%"
					height="300px"
					onChange={({json}) => { console.log(json); setEditedJsonConfig(json)}}
				/>
			</CardContent>
			<CardButtons>
				<Button background={'error'} fontSize="subheading" onClick={removeGateway}>Remove</Button>
				{!gateway.isActive && <Button background={'ok'} fontSize="subheading" onClick={activateGateway}>Activate</Button>}
				{gateway.isActive && <Button background={'warn'} fontSize="subheading" onClick={deactivateGateway}>Deactivate</Button>}
				<Button	
					fontSize="subheading"
					background={isConfigSaved ? 'fg1' : 'brand'}
					onClick={() => saveGatewayConfig(editedJsonConfig)}
				>
					Save Config
				</Button>
			</CardButtons>
		</Card>
	)
}
