import React from 'react'

import {
	useRef
} from 'react'

import {
	useMutation,
	gql
} from '@apollo/client'

import { CenteredCardContainer } from '../ui-kit/cards'
import { Label } from '../ui-kit/nubbins'

const ADD_USER_MUTATION = gql`
	mutation AddUser($username: String!, $password: String!, $displayName: String!, $permissions: [String]!) {
		addUser(username: $username, password: $password, displayName: $displayName, permissions: $permissions )
	}
`

const AddUserCard = ({ onSubmit }) => {

	const usernameRef = useRef(null)
	const displayNameRef = useRef(null)
	const passwordRef = useRef(null)

	const submitHandler = e => {
		e.preventDefault()
		onSubmit && onSubmit({
			username: usernameRef.current.value,
			displayName: displayNameRef.current.value,
			password: passwordRef.current.value,
			permissions: ['admin'] // STUB
		})
	}

	return (<div>
		<form onSubmit={submitHandler}>

			<label>username</label>
			<br />
			<input name="username" ref={usernameRef} />
			<br />

			<label>display name</label>
			<br />
			<input name="displayname" ref={displayNameRef} />
			<br />

			<label>password</label>
			<br />
			<input name="password" ref={passwordRef} />
			<br />

			<input type="submit" />

		</form>
	</div>)
}

export const OnboardingView = () => {

	const [createUserMutation] = useMutation(ADD_USER_MUTATION)
	const onSubmit = userData => { createUserMutation({ variables: userData }).catch(console.error) }

	return (
		<CenteredCardContainer>
			<CenteredCardContainer>
				<AddUserCard onSubmit={onSubmit} />
			</CenteredCardContainer>
		</CenteredCardContainer>
	)

}
