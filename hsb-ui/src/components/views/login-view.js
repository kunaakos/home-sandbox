import React from 'react'
import { useRef } from 'react'

import { CenteredCardContainer } from '../ui-kit/cards'
import { Label } from '../ui-kit/nubbins'

const LoginCard = ({ onSubmit }) => {

	const usernameRef = useRef(null)
	const passwordRef = useRef(null)

	const submitHandler = e => {
		e.preventDefault()
		onSubmit && onSubmit({
			username: usernameRef.current.value,
			password: passwordRef.current.value
		})
	}

	return (<div>
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

export const LoginView = ({
	auth
}) => {

	return (
		<CenteredCardContainer>
			{auth.status === 'unauthenticated' && <LoginCard onSubmit={auth.login} />}
			{auth.status === 'error' && <Label>Something went wrong, try reloading :(</Label>}
		</CenteredCardContainer>
	)

}
