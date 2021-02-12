import { ApolloServer, gql } from 'apollo-server'
import { buildFederatedSchema } from '@apollo/federation'
import { applyMiddleware } from 'graphql-middleware'
import { rule, shield, and } from 'graphql-shield'

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import {
	getCredentials,
	getUser,
	getUsers,
	addUser,
	removeUser,
	activateUser,
	deactivateUser,
	onboardUser
} from './queries'

import { logger } from './logger'

const USER_TOKEN_SECRET = process.env.GATEKEEPER__USER_TOKEN_SECRET
const USER_TOKEN_ISSUER = 'domain.name' // TODO after dynamic dns + https sorted out
const USER_TOKEN_LIFETIME_IN_SECONDS = 2 * 24 * 60 * 60 // two days

const currenUnixTimeInSeconds = () => Math.floor(Date.now() / 1000)

const issueUserToken = user => {

	const tokenExpiresAt = currenUnixTimeInSeconds() + USER_TOKEN_LIFETIME_IN_SECONDS
	const token = jwt.sign(
		{
			user,
			exp: tokenExpiresAt
		},
		USER_TOKEN_SECRET,
		{
			algorithm: "HS256",
			issuer: USER_TOKEN_ISSUER,
			subject: `${user.id}`
		}
	)

	return {
		token,
		tokenExpiresAt
	}
}

const isAuthenticated = rule()((parent, args, { user }) => user !== null)
const isActive = rule()((parent, args, { user }) => user && user.status === 'active')
const isAdmin = rule()((parent, args, { user }) => user.privileges.includes('admin'))
const isNotTargetingThemselves = rule()((parent, { idUser }, { user }) => idUser !== user.id)

const typeDefs = gql`

  type User @key(fields: "id") {
	id: ID!,
	displayName: String!,
	status: String!,
	# replace with an array
	privileges: [String]!
  }

  type LoginResponse {
	  user: User, # user object
	  token: String, # JWT
	  tokenExpiresAt: Int # unix time in seconds
  }

  type OnboardingDetailsResponse {
	displayName: String!,
	isOnboarded: Boolean!
  }

  type AuthStateResponse {
	  currentUser: User
	  redirectToOnboard: ID
  }

  extend type Query {
	# user(id: ID!): User
    users: [User]!
	authState: AuthStateResponse!
	onboardingDetails(idUser: ID!): OnboardingDetailsResponse!
  }

  extend type Mutation {
    login(username: String!, password: String!): LoginResponse
	refreshUserToken: LoginResponse
	addUser(displayName: String!, privileges: [String]!): ID!
	removeUser(idUser: ID!): ID!
	activateUser(idUser: ID!): ID!
	deactivateUser(idUser: ID!): ID!
	onboardUser(idUser:ID!, displayName: String!, username: String!, password: String!): ID!
  }

`;

const permissions = shield({
	Query: {
		// user: and(isAuthenticated, isActive, isAdmin),
		users: and(isAuthenticated, isActive, isAdmin),
	},
	Mutation: {
		refreshUserToken: isAuthenticated,
		addUser: and(isAuthenticated, isActive, isAdmin),
		removeUser: and(isAuthenticated, isActive, isAdmin, isNotTargetingThemselves),
		activateUser: and(isAuthenticated, isActive, isAdmin, isNotTargetingThemselves),
		deactivateUser: and(isAuthenticated, isActive, isAdmin, isNotTargetingThemselves)
	}
})

const resolvers = state => ({

	// User: {
	// 	_resolveReference(object) {
	// 		// TODO
	// 		return null
	// 	}
	// },

	Query: {

		users: async () => {
			return await getUsers()
		},

		onboardingDetails: async (parent, { idUser }) => {
			try {
				const user = await getUser(idUser)
				return {
					displayName: user.displayName,
					isOnboarded: user.status !== 'onboarding'
				}
			} catch(error) {
				logger.error(error)
				throw new Error('Error.')
			}	
		},

		authState: (parent, args, context) => ({
			currentUser: context.user,
			...(Boolean(state.idFirstUser) && { redirectToOnboard: state.idFirstUser })
		})

	},

	Mutation: {

		login: async (parent, { username, password: plaintextPassword }) => {
			try {
				const credentials = await getCredentials(username)
				if (
					credentials && await bcrypt.compare(plaintextPassword, credentials.passwordHash)
				) {
					const user = await getUser(credentials.idUser)
					return {
						user,
						...issueUserToken(user)
					}
				} else {
					return null
				}
			} catch (error) {
				logger.error(error)
				throw new Error('Error.')
			}
		},

		refreshUserToken: (parent, args, context) => issueUserToken(context.user),

		addUser: async (parent, { displayName, privileges }) => {
			try {
				return await addUser({ displayName, privileges })
			} catch (error) {
				logger.error(error)
				throw new Error('Error.')
			}
		},

		removeUser: async (parent, { idUser }) => {
			try {
				await removeUser(idUser)
				return idUser
			} catch (error) {
				logger.error(error)
				throw new Error('Error.')
			}
		},

		activateUser: async (parent, { idUser }) => {
			try {
				await activateUser(idUser)
				return idUser
			} catch (error) {
				logger.error(error)
				throw new Error('Error.')
			}
		},

		deactivateUser: async (parent, { idUser }) => {
			try {
				await deactivateUser(idUser)
				return idUser
			} catch (error) {
				logger.error(error)
				throw new Error('Error.')
			}
		},

		onboardUser: async (parent, { idUser, displayName, username, password: plaintextPassword }, context) => {
			try {
				const isFirstUser = Boolean(context.state.idFirstUser) && idUser === context.state.idFirstUser
				await onboardUser({
					idUser,
					displayName,
					username,
					passwordHash: await bcrypt.hash(plaintextPassword, 10),
					activate: isFirstUser
				})
				if (isFirstUser) {
					context.state.idFirstUser = null
					logger.info('first user onboarded')
				}
				return idUser
			} catch (error) {
				logger.error(error)
				throw new Error('Error.')
			}
		}

	}
})

/**
 * Side effect-ey fucntion that checks if creating a first user is needed.
 * Returns null if there's at least one active user
 * or the id of the first user if they were not yet activated.
 */ 
const checkForFirstUser = async () => {
	const users = await getUsers()
	if (users.length === 0) {
		// no users added yet
		logger.info('adding first user to database')
		return await addUser({
			displayName: 'First User',
			privileges: ['admin']
		})
	} else if (users.length === 1 && users[0].status === 'onboarding') {
		// a user was added by the app, but not onboarded yet
		return users[0].id
	} else {
		// there should be at least one active, onboarded user
		return null
	}
}

const main = async () => {

	const state = {
		idFirstUser: await checkForFirstUser()
	}

	logger.debug('graphql app initialization')

	const apolloServer = new ApolloServer({
		schema: applyMiddleware(
			buildFederatedSchema([{
				typeDefs,
				resolvers: resolvers(state)
			}]),
			permissions
		),
		logger,
		context: ({ req }) => {
			const user = req.headers['hsb-user-json'] ? JSON.parse(req.headers['hsb-user-json']) : null;
			return { user, state }
		}
	})

	apolloServer.listen({ port: process.env.HSB__KEYMASTER_PORT }).then(({ url }) => {
		logger.trace(`keymaster service gql api ready at ${url}`)
	})

}

const fatalErrorHandler = message => error => {
	logger.fatal(error, message)
	process.exit(1)
}

process.on('uncaughtException', fatalErrorHandler('uncaught exception'))
process.on('unhandledRejection', fatalErrorHandler('unhandled promise rejection'))
main().catch(fatalErrorHandler('application error'))
