import {
	useEffect,
} from 'react'


const THREE_SECONDS = 1000 * 3

const fetchCurrentToken = () => 
	fetch('/api/auth/current-token')
		.then(response => response.json())

const fetchNewToken = () =>
	fetch('/api/auth/renew-token')
		.then(response => response.json())

const keepTokenUpdated = token => {

	try {
		const userTokenExpiresInMs = Math.floor(token.exp - (Date.now() / 1000)) * 1000
		const fetchNewTokenInMs = userTokenExpiresInMs - THREE_SECONDS

		if (isNaN(fetchNewTokenInMs) || fetchNewTokenInMs <= 0) {
			throw new Error('could not parse user token')
		}

		window.setTimeout(
			() => fetchNewToken().then(keepTokenUpdated),
			fetchNewTokenInMs
		)

	} catch (error) {
		console.error(error)	
	}
	
}

export const useUserToken = () =>
	useEffect(() => {
		fetchCurrentToken().then(keepTokenUpdated)
	}, [])
