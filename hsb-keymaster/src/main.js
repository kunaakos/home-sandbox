import { ApolloServer, gql } from 'apollo-server'
import { buildFederatedSchema } from '@apollo/federation'
import { applyMiddleware } from 'graphql-middleware'
import { rule, shield } from 'graphql-shield'

import jwt from 'jsonwebtoken'

import { initMongodb } from 'hsb-service-utils/build/persistence'
import { makeMongoCollection } from 'hsb-service-utils/build/object-mappers'
import {
	User,
	Password
} from 'hsb-service-utils/build/schemas'
import bcrypt from 'bcrypt'

const USER_TOKEN_SECRET = process.env.GATEKEEPER__USER_TOKEN_SECRET
const USER_TOKEN_ISSUER = 'domain.name' // TODO after dynamic dns + https sorted out
const USER_TOKEN_EXPIRY = '1h' // TODO

import { makeLogger } from 'hsb-service-utils/build/logger'

const logger = makeLogger({
	serviceName: 'kymstr',
	serviceColor: 'yellow',
	environment: process.env.NODE_ENV,
	forceLogLevel: process.env.HSB__LOG_LEVEL
})

// todo: env var
const port = 4005

const isAuthenticated = rule()((parent, args, { user }) => {
	return user !== null;
});

const typeDefs = gql`

  type User @key(fields: "_id") {
	_id: ID!,
	username: String!,
	displayName: String!,
	# replace with an array
	permissions: [String]!
  }

  type LoginResponse {
	  user: User,
	  token: String
  }

  extend type Query {
	user(id: ID!): User
    users: [User]
	currentUser: User
  }

  extend type Mutation {
    login(username: String!, password: String!): LoginResponse
  }

`;

const permissions = shield({
	Query: {
		user: isAuthenticated,
		users: isAuthenticated,
		currentUser: isAuthenticated
	}
})

const makeResolvers = ({ Users, Passwords }) => ({
	User: {
		_resolveReference(object) {
			// TODO
			return null
		}
	},
	Query: {
		users: () => {
			// TODO
			return null
		},
		currentUser: (parent, args, context) => {
			return context.user
		}
	},
	Mutation: {
		login: async (parent, { username, password: plaintextPassword }) => {
			try {
				const password = await Passwords.getOne({ username })

				if (
					await bcrypt.compare(plaintextPassword, password.hash)
				) {
					const user = await Users.getOne(password._id)

					if (!user) {
						throw new Error('no matchy')
					} else {

						const token = jwt.sign(
							{
								user
							},
							USER_TOKEN_SECRET,
							{
								algorithm: "HS256",
								issuer: USER_TOKEN_ISSUER,
								subject: `${user.id}`,
								expiresIn: USER_TOKEN_EXPIRY
							}
						)

						return {
							user,
							token
						}

					}

				} else {
					throw new Error('no matchy')
				}

			} catch (error) {
				logger.error(error)
				throw new Error('wut')
			}
		}
	}
})

const main = async () => {

	logger.debug('persistence layer initialization')

	const mongoDatabase = await initMongodb({
		dbHost: process.env.HSB__MONGO_DBHOST,
		dbPort: process.env.HSB__MONGO_DBPORT,
		dbName: process.env.HSB__MONGO_DBNAME,
		username: process.env.HSB__MONGO_USERNAME,
		password: process.env.HSB__MONGO_PASSWORD
	})

	const Users = makeMongoCollection({
		mongoDatabase,
		collectionName: 'users',
		schema: User
	})

	const Passwords = makeMongoCollection({
		mongoDatabase,
		collectionName: 'passwords',
		schema: Password
	})

	logger.debug('graphql app initialization')

	const apolloServer = new ApolloServer({
		schema: applyMiddleware(
			buildFederatedSchema([{
				typeDefs,
				resolvers: makeResolvers({
					Users,
					Passwords
				})
			}]),
			permissions
		),
		context: ({ req }) => {
			const user = req.headers['hsb-user-json'] ? JSON.parse(req.headers['hsb-user-json']) : null;
			return { user }
		}
	})

	apolloServer.listen({ port }).then(({ url }) => {
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
