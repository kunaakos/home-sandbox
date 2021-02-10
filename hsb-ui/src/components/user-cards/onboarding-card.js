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

export const OnboardingCard = ({ displayName, onboardUser }) => {

	const usernameRef = useRef(null)
	const passwordRef = useRef(null)

	const submitHandler = e => {
		e.preventDefault()
		onboardUser && onboardUser({
			username: usernameRef.current.value,
			password: passwordRef.current.value
		})
	}

	return (
		<Card
			background={'bg1'}
		>
			<TitleBar>
				<Label
					fullWidth
					textAlign={'start'}
					background={'bg1'}
					color={'fg1'}
				>
					Hi there, {displayName}!
				</Label>
			</TitleBar>
			<CardLabel fontSize='paragraph' textAlign='left'>To activate your account, please provide the credentials you'll be using to log in.</CardLabel>
			<CardLabel fontSize='paragraph'>username <input name="username" ref={usernameRef} /></CardLabel>
			<CardLabel fontSize='paragraph'>password <input type="password" name="password" ref={passwordRef} /></CardLabel>
			<CardButtons>
				<Button fontSize="subheading" onClick={submitHandler}>Submit</Button>
			</CardButtons>
		</Card>
	)
}
