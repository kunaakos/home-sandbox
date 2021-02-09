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
	removeUser
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
const isAdmin = rule()((parent, args, { user }) => user.privileges.includes('admin'))
const isNotTargetingThemselves = rule()((parent, args, { user }) => {
	return user.id !== args.id
})

const typeDefs = gql`

  type User @key(fields: "id") {
	id: ID!,
	displayName: String!,
	# replace with an array
	privileges: [String]!
  }

  type LoginResponse {
	  user: User, # user object
	  token: String, # JWT
	  tokenExpiresAt: Int # unix time in seconds
  }

  extend type Query {
	# user(id: ID!): User
    users: [User]
	currentUser: User
  }

  extend type Mutation {
    login(username: String!, password: String!): LoginResponse
	refreshUserToken: LoginResponse
	addUser(username: String!, password: String!, displayName: String!, privileges: [String]!): ID!
	removeUser(id: ID!): ID!
  }

`;

const privileges = shield({
	Query: {
		// user: isAuthenticated,
		users: and(isAuthenticated, isAdmin),
	},
	Mutation: {
		refreshUserToken: isAuthenticated,
		// addUser: and(isAuthenticated, isAdmin),
		removeUser: and(isAuthenticated, isAdmin, isNotTargetingThemselves)
	}
})

const resolvers = {
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
		currentUser: (parent, args, context) => {
			return context.user
		}
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
				throw new Error('Server error.')
			}
		},
		refreshUserToken: (parent, args, context) => issueUserToken(context.user),
		addUser: async (parent, args, context) => {
			try {
				await addUser(args)
			} catch (error) {
				logger.error(error)
			}
		},
		removeUser: (parent, args, context) => removeUser(args)
	}
}

const main = async () => {

	logger.debug('graphql app initialization')

	const apolloServer = new ApolloServer({
		schema: applyMiddleware(
			buildFederatedSchema([{
				typeDefs,
				resolvers
			}]),
			privileges
		),
		logger,
		context: ({ req }) => {
			const user = req.headers['hsb-user-json'] ? JSON.parse(req.headers['hsb-user-json']) : null;
			return { user }
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
