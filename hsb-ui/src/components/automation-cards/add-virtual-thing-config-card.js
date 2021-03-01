import React from 'react'
import {
	useRef
} from 'react'

import { 
	Card,
	TitleBar
} from '../ui-kit/cards'
import {
	Label,
	CardLabel,
	Button,
	CardButtons
} from '../ui-kit/nubbins'

export const AddVirtualThingConfigCard = ({ addVirtualThingConfig }) => {

	const typeRef = useRef(null)
	const labelRef = useRef(null)

	const addVirtualThingConfigClick = () => {
		addVirtualThingConfig && addVirtualThingConfig({
			type: typeRef.current.value,
			label: labelRef.current.value,
		})
		labelRef.current.value = ''
	}

	return (
		<Card background='fg1' a>
			<TitleBar>
				<Label fullWidth textAlign='start' background='fg1' color='bg1'>
					New Virtual Thing
				</Label>
			</TitleBar>
			<CardLabel fontSize='paragraph' textAlign='left' color='bg1'>
				type&nbsp;
				<select ref={typeRef}>
				{['thermostat'].map((type) => (
					<option key={type} value={type}>
					{type}
					</option>
				))}
				</select>
			</CardLabel>
			<CardLabel fontSize='paragraph' textAlign='left' color='bg1'>
				label&nbsp;
				<input name='label' autoComplete='off' ref={labelRef} />
			</CardLabel>
			<CardButtons>
				<Button fontSize='subheading' onClick={addVirtualThingConfigClick}>
					Add
				</Button>
			</CardButtons>
		</Card>
	)
}
