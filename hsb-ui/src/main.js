import React from 'react'
import ReactDOM from 'react-dom'

import { App } from './components/app'

import {
	ApolloClient,
	InMemoryCache,
	createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { ApolloProvider } from '@apollo/client'

const httpLink = createHttpLink({
	uri: '/gql',
})

const authLink = setContext((_, { headers }) => {
	// get the authentication token from local storage if it exists
	const token = localStorage.getItem('hsb_user_token');
	// return the headers to the context so httpLink can read them
	return {
		headers: token
			? {
				...headers,
				authorization: `Bearer ${token}`,
			}
			: headers
	}
})

const apolloClient = new ApolloClient({
	link: authLink.concat(httpLink),
	cache: new InMemoryCache()
})

ReactDOM.render(
	<ApolloProvider client={apolloClient}>
		<App />
	</ApolloProvider>,
	document.getElementById('root')
)
