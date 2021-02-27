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

export const VirtualThingConfigCard = ({ virtualThingConfig, removeVirtualThingConfig, activateVirtualThing, deactivateVirtualThing, saveVirtualThingConfig }) => {

	const [editedJsonConfig, setEditedJsonConfig] = useState(virtualThingConfig.jsonConfig)
	const isConfigSaved = editedJsonConfig === virtualThingConfig.jsonConfig

	return (
		<Card
			data-id={virtualThingConfig.id}
			background={'bg1'}
		>
			<TitleBar>
				<Label
					fullWidth
					textAlign={'start'}
					background={'bg1'}
					color={'fg1'}
				>
					{virtualThingConfig.label}
				</Label>
			</TitleBar>
			<CardLabel fontSize='paragraph'>type: {virtualThingConfig.type}</CardLabel>
			<CardLabel fontSize='paragraph'>config:</CardLabel>
			<CardContent>
				<JSONInput
					placeholder={JSON.parse(virtualThingConfig.jsonConfig)}
					locale={EN_LOCALE}
					colors={editorColors}
					width='100%'
					height='300px'
					onChange={({json}) => { setEditedJsonConfig(json) }}
				/>
			</CardContent>
			<CardButtons>
				<Button background={'error'} fontSize='subheading' onClick={removeVirtualThingConfig}>Remove</Button>
				{!virtualThingConfig.isActive && <Button background={'ok'} fontSize='subheading' onClick={activateVirtualThing}>Activate</Button>}
				{virtualThingConfig.isActive && <Button background={'warn'} fontSize='subheading' onClick={deactivateVirtualThing}>Deactivate</Button>}
				<Button	
					fontSize='subheading'
					background={isConfigSaved ? 'fg1' : 'brand'}
					onClick={() => saveVirtualThingConfig(editedJsonConfig)}
				>
					Save Config
				</Button>
			</CardButtons>
		</Card>
	)
}
