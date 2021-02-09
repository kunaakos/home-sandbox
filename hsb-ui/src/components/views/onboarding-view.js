import React from 'react'
import {
	useState,
	useRef
} from 'react'
import { useParams } from "react-router-dom"

import {
	useQuery,
	useMutation,
	gql
} from '@apollo/client'

import { CenteredCardContainer } from '../ui-kit/cards'
import { Label, NavButton } from '../ui-kit/nubbins'

const ONBOARDING_VIEW_QUERY = gql`
	query OnboardingViewQuery($idUser: ID!) {
		onboardingDetails(idUser: $idUser) {
			displayName,
			isOnboarded
		}
	}
`

const ONBOARD_USER_MUTATION = gql`
	mutation OnboardUser($idUser: ID!, $username: String!, $password: String!) {
		onboardUser(idUser: $idUser, username: $username, password: $password)
	}
`

const OnboardUserCard = ({ displayName, onboardUser }) => {

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

export const OnboardingView = () => {

	const { idUser } = useParams()
	const [ onboardUserMutation ] = useMutation(ONBOARD_USER_MUTATION)
	const {
		loading,
		error,
		data,
		refetch
	} = useQuery(ONBOARDING_VIEW_QUERY, { variables: { idUser } })

	const [isInvalidLink, setIsInvalidLink] = useState(false)

	const onboardUser = async ({username, password}) => { 
		try {
			await onboardUserMutation({ variables: { idUser, username, password } })
			refetch()
		} catch (error) {
			console.error(error)
		}
	}

	if (!loading && !error && !data.onboardingDetails) {
		setIsInvalidLink(true)
	}

	const isOnboarded = !loading && !error && data.onboardingDetails.isOnboarded === true

	return (
		<CenteredCardContainer>
			{loading && <Label>Loading...</Label>}
			{isInvalidLink && <Label>The onboarding link seems malformed or expired :(</Label>}
			{error && <Label>Something went wrong :(</Label>}
			{isOnboarded && <>
				<Label>You have successfully completed the onboarding process, and can now log in with the credentials you provided.</Label>
				<NavButton to='/login'>Go to login</NavButton>
			</>}
			{!loading && !error && !isInvalidLink && !isOnboarded && <OnboardUserCard displayName={data.onboardingDetails && data.onboardingDetails.displayName} onboardUser={onboardUser} />}
		</CenteredCardContainer>
	)

}
