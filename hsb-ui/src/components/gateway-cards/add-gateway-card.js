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

export const AddGatewayCard = ({ addGateway }) => {

	const typeRef = useRef(null)
	const labelRef = useRef(null)

	const addGatewayClick = () => {
		addGateway && addGateway({
			type: typeRef.current.value,
			label: labelRef.current.value,
		})
		labelRef.current.value = ''
	}

	return (
		<Card
			background='fg1'
		>
			<TitleBar>
				<Label
					fullWidth
					textAlign='start'
					background='fg1'
					color='bg1'
				>
					New gateway
				</Label>
			</TitleBar>
			<CardLabel fontSize='paragraph' color='bg1' textAlign='left'>
				type&nbsp;
				<select ref={typeRef}>
					{[
						['tradfri', 'IKEA TRÅDFRI'],
						['serial', 'Serial'],
						['rpi-gpio', 'GPIO'],
						['aio', 'adafruit.io'],
						['mi-ble', 'Xiaomi Bluetooth'],
					].map(([type, label ]) => <option key={type} value={type}>{label}</option>)}
				</select>
			</CardLabel>
			<CardLabel fontSize='paragraph' color='bg1' textAlign='left'>
				label&nbsp;
				<input name='label' autoComplete='off' ref={labelRef} />
			</CardLabel>
			<CardButtons>
				<Button fontSize='subheading' onClick={addGatewayClick}>Add</Button>
			</CardButtons>
		</Card>
	)
}
