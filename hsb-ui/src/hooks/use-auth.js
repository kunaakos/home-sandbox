import { useEffect } from 'react'
import {
	useQuery,
	useMutation,
	gql
} from '@apollo/client'

const clearStoredToken = () => {
	localStorage.removeItem('hsb_user_token')
	localStorage.removeItem('hsb_user_token_expires_at')
}

export const CurrentUserToken = {

	set: ({
		token,
		tokenExpiresAt
	}) => {
		localStorage.setItem('hsb_user_token', token)
		localStorage.setItem('hsb_user_token_expires_at', tokenExpiresAt)
	},

	get: () => {

		const tokenFromStorage = localStorage.getItem('hsb_user_token')
		const tokenExpiresAtFromStorage = localStorage.getItem('hsb_user_token_expires_at')

		if (!tokenFromStorage || !tokenExpiresAtFromStorage) {
			return {}
		}

		const tokenExpiresAt = parseInt(tokenExpiresAtFromStorage)

		if (isNaN(tokenExpiresAt) || isPast(tokenExpiresAt)) {
			clearStoredToken()
			return {}
		}

		return {
			token: tokenFromStorage, // NOTE: not validated!
			tokenExpiresAt
		}

	}

}

const TEN_SECONDS = 10000

const untilItsAlmost = tokenExpiresAt => tokenExpiresAt * 1000 - Date.now() - TEN_SECONDS
const isPast = tokenExpiresAt => tokenExpiresAt * 1000 <= Date.now()
const isClose = tokenExpiresAt => tokenExpiresAt * 1000 - Date.now() <= TEN_SECONDS

const CURRENT_USER_QUERY = gql`
	query GetCurrentUser {
		currentUser {
			id,
			displayName,
			username,
			permissions
		}
	}
`

const LOGIN_MUTATION = gql`
	mutation Login($username: String!, $password: String!) {
		login(username: $username, password: $password) {
			token,
			tokenExpiresAt
		}
	}
`

const REFRESH_TOKEN_MUTATION = gql`
	mutation RefreshUserToken {
		refreshUserToken {
			token,
			tokenExpiresAt
		}
	}
`

export const useAuth = () => {

	const {
		loading: currentUserLoading,
		error: currentUserError,
		data: currentUserData,
		refetch: refetchCurrentUser
	} = useQuery(CURRENT_USER_QUERY)

	const [loginMutation] = useMutation(LOGIN_MUTATION)
	const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION)

	useEffect(
		// if we had a valid token on initial load, make sure it's refreshed before it expires
		() => {
			const { tokenExpiresAt } = CurrentUserToken.get()

			if (!tokenExpiresAt) { // no stored token, do nothing
				return
			} else if (isClose(tokenExpiresAt)) { // token expiring soon, refresh ASAP
				keepRefreshingToken()
			} else { // token is valid, refresh when it's close to expiring
				keepRefreshingToken(tokenExpiresAt)
			}
		},
		[] // run on init only
	)

	const keepRefreshingToken = tokenExpiresAt => {

		const nextTokenRefresh = () => {
			refreshTokenMutation()
				.then(({ data }) => {
					if (data.refreshUserToken && data.refreshUserToken.token && data.refreshUserToken.tokenExpiresAt) {
						CurrentUserToken.set(data.refreshUserToken)
						keepRefreshingToken(data.refreshUserToken.tokenExpiresAt)
					} else {
						console.error('Error refreshing user token.')
						refetchCurrentUser()
					}
				})
				.catch(error => {
					console.error(error)
					refetchCurrentUser()
				})
		}
		
		tokenExpiresAt
			? window.setTimeout(nextTokenRefresh, untilItsAlmost(tokenExpiresAt))
			: nextTokenRefresh()

	}

	let currentUser = null
	let status = 'unauthenticated'

	if (currentUserLoading) {
		status = 'loading'
	} else if (currentUserError) {
		status = 'error'
	} else if (currentUserData.currentUser) {
		currentUser = currentUserData.currentUser
		status = 'authenticated'
	}

	return {
		login: credentials => {
			loginMutation({ variables: credentials }).then(({ data }) => {
				if (data && data.login && data.login.token && data.login.tokenExpiresAt) {
					CurrentUserToken.set(data.login)
					refetchCurrentUser()
					keepRefreshingToken(data.login.tokenExpiresAt)
				}
			})
		},
		currentUser,
		status
	}

}
