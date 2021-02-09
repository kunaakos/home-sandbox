import React from 'react'
import {
	useRef
} from 'react'

import { Label } from '../ui-kit/nubbins'

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

	return (<div>

		<Label>Hi there, {displayName}!</Label>
		<Label fontSize='paragraph' textAlign='left'>To activate your account, please provide the credentials that you'll be using to log in.</Label>

		<form onSubmit={submitHandler}>

			<label>username</label>
			<br />
			<input name="username" ref={usernameRef} />
			<br />

			<label>password</label>
			<br />
			<input name="password" ref={passwordRef} />
			<br />

			<input type="submit" />

		</form>

	</div>)
}
