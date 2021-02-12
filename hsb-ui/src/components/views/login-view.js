import React from 'react'
import { useRef } from 'react'

import { CenteredCardContainer } from '../ui-kit/cards'

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
			<input type="password" name="password" ref={passwordRef} />
			<br />

			<input type="submit" />

		</form>
	</div>)
}

export const LoginView = ({
	login
}) => {

	return (
		<CenteredCardContainer>
			<LoginCard onSubmit={login} />
		</CenteredCardContainer>
	)

}
