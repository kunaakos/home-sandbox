import { logger } from './logger'

import { ApolloServer, gql } from 'apollo-server'
import { buildFederatedSchema } from '@apollo/federation'
import { applyMiddleware } from 'graphql-middleware'
import { rule, shield, and } from 'graphql-shield'

import {
	addGatewayConfig,
	readGatewayConfigs,
	updateGatewayConfig,
	removeGatewayConfig,
	addSubscription,
	readSubscriptions,
	updateSubscription,
	removeSubscription
} from './db-queries'

const typeDefs = gql`

  type Thing @key(fields: "id") {
	id: ID!
    type: String!
	label: String!
	hidden: Boolean! 
    state: String! # stringified JSON object
  }

  type GatewayConfig @key(fields: "id") {
	id: ID!
	type: String!
	label: String!
	isActive: Boolean!
	jsonConfig: String!
  }

  type SubscriptionConfig @key(fields: "id") {
	id: ID!
	publisherId: ID!
	subscriberId: ID!
	jsonMapping: String!
	isActive: Boolean!
  }

  extend type Query {
	thing(id: ID!): Thing
    things(visibleOnly: Boolean): [Thing]
	gateways: [GatewayConfig]!
	subscriptions: [SubscriptionConfig]!
  }

  extend type Mutation {
    setThing(id: ID!, newValues: String!): Boolean
	addGateway(type: String!, label: String!, isActive: Boolean!, jsonConfig: String!): ID!
	updateGateway(id: ID!, type: String, label: String, isActive: Boolean, jsonConfig: String): ID!
	removeGateway(idGateway: ID!): ID!
	addSubscription(publisherId: ID!, subscriberId: ID!, jsonMapping: String!, isActive: Boolean!): ID!
	updateSubscription(subscriptionId: ID!, jsonMapping: String, isActive: Boolean): ID!
	removeSubscription(subscriptionId: ID!): ID!
  }

`

const mapThingState = thing => {
	const {
		type,
		id,
		fingerprint,
		label,
		isHidden,
		...state
	} = thing
	return {
		type,
		id,
		label,
		hidden: isHidden,
		// the shape of the state object is different for every type of thing, will have to figure out a better way to type it
		// this is why this function is needed
		state: JSON.stringify(state)
	}
}

const isAuthenticated = rule()((parent, args, { user }) => user !== null)
const isActive = rule()((parent, args, { user }) => user && user.status === 'active')
const isAdmin = rule()((parent, args, { user }) => user.privileges.includes('admin'))

const permissions = shield({
	Query: {
		thing: and(isAuthenticated, isActive, isAdmin),
		things: and(isAuthenticated, isActive, isAdmin),
		gateways: and(isAuthenticated, isActive, isAdmin),
		subscriptions: and(isAuthenticated, isActive, isAdmin)
	},
	Mutation: {
		setThing: and(isAuthenticated, isActive, isAdmin),
		addGateway: and(isAuthenticated, isActive, isAdmin),
		updateGateway: and(isAuthenticated, isActive, isAdmin),
		removeGateway: and(isAuthenticated, isActive, isAdmin),
		addSubscription: and(isAuthenticated, isActive, isAdmin),
		updateSubscription: and(isAuthenticated, isActive, isAdmin),
		removeSubscription: and(isAuthenticated, isActive, isAdmin)
	}
})

const makeResolvers = ({ things }) => ({
	
	Query: {

		thing: (parent, {id}) => {
			try {
				return mapThingState(things.get(id))
			} catch(error) {
				logger.error(error)
				return new Error(`Could not get state for thing ${id}: ${error.message}`)
			}
		},

		things: (parent, args) => {
			try {
				const allThings = things.getAll().map(mapThingState)
				return args.visibleOnly
					? allThings.filter(thing => !thing.hidden)
					: allThings
			} catch(error) {
				logger.error(error)
				return new Error(`Could not thing states: ${error.message}`)
			}
		},

		gateways: async (parent, args, context) => {
			try {
				return await readGatewayConfigs()
			} catch(error) {
				logger.error(error)
				return new Error(`Could not read gateway configs: ${error.message}`)
			}
		},

		subscriptions: async (parent, args, context) => {
			try {
				return await readSubscriptions()
			} catch(error) {
				logger.error(error)
				return new Error(`Could not read subscriptions: ${error.message}`)
			}
		},

	},

	Mutation: {

		setThing: async (parent, { id, newValues }) => {
			try {
				things.set(id, JSON.parse(newValues))
				return true
			} catch (error) {
				return false // figure out what to return later (errors if any, but what format)
			}
		},

		addGateway: async (parent, gatewayConfig, context) => {
			try {
				return await addGatewayConfig(gatewayConfig)
			} catch(error) {
				logger.error(error)
				return new Error(`Could not create gateway config: ${error.message}`)
			}
		},

		updateGateway: async (parent, gatewayConfig, context) => {
			try {
				await updateGatewayConfig(gatewayConfig)
				return gatewayConfig.id
			} catch(error) {
				logger.error(error)
				return new Error(`Could not update gateway config: ${error.message}`)
			}
		},

		removeGateway: async (parent, { idGateway }, context) => {
			try {
				await removeGatewayConfig(idGateway)
				return idGateway
			} catch(error) {
				logger.error(error)
				return new Error(`Could not delete gateway config: ${error.message}`)
			}
		},

		addSubscription: async (parent, args, context) => {
			try {
				return await addSubscription(args)
			} catch(error) {
				logger.error(error)
				return new Error(`Could not create gateway config: ${error.message}`)
			}
		},

		updateSubscription: async (parent, args, context) => {
			try {
				await updateSubscription(args)
				return args.subscriptionId
			} catch(error) {
				logger.error(error)
				return new Error(`Could not update gateway config: ${error.message}`)
			}
		},

		removeSubscription: async (parent, { subscriptionId }, context) => {
			try {
				await removeSubscription(subscriptionId)
				return subscriptionId
			} catch(error) {
				logger.error(error)
				return new Error(`Could not delete gateway config: ${error.message}`)
			}
		}

	}
})

export const initializeGqlServer = ({
	things
}) => {

	const apolloServer = new ApolloServer({
		schema: applyMiddleware(
			buildFederatedSchema([{
				typeDefs,
				resolvers: makeResolvers({
					things
				})
			}]),
			permissions
		),
		logger,
		context: ({ req }) => {
			const user = req.headers['hsb-user-json'] ? JSON.parse(req.headers['hsb-user-json']) : null
			return { user }
		}
	})

	apolloServer.listen({ port: process.env.HSB__THINGS_PORT }).then(({ url }) => {
		logger.trace(`thing service gql api ready at ${url}`)
	})

}
