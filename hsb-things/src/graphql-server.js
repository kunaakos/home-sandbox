import { logger } from './logger'

import { ApolloServer, gql } from 'apollo-server'
import { buildFederatedSchema } from '@apollo/federation'
import { applyMiddleware } from 'graphql-middleware'
import { rule, shield } from 'graphql-shield'

// todo: env var
const port = 4001

const typeDefs = gql`

  type Thing @key(fields: "id") {
    type: String!
	id: ID!
	label: String!
	hidden: Boolean! 
    state: String! # stringified JSON object
  }

  extend type Query {
	thing(id: ID!): Thing
    things: [Thing]
  }

  extend type Mutation {
    setThing(id: ID!, newValues: String!): Boolean
  }

`

const mapThingState = thing => {
	const {
		type,
		id,
		label,
		hidden,
		...state
	} = thing
	return {
		type,
		id,
		label,
		hidden,
		// the shape of the state object is different for every type of thing, will have to figure out a better way to type it
		// this is why this function is needed
		state: JSON.stringify(state)
	}
}

const isAuthenticated = rule()((parent, args, { user }) => {
	return user !== null
})

const permissions = shield({
	Query: {
		things: isAuthenticated
	},
	Mutation: {
		setThing: isAuthenticated
	}
})

const makeResolvers = ({ things }) => ({
	Thing: {
		_resolveReference(object) {
			return mapThingState(things.get(object.id))
		}
	},
	Query: {
		things: () => things.getAll().map(mapThingState)
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
		context: ({ req }) => {
			const user = req.headers['hsb-user-json'] ? JSON.parse(req.headers['hsb-user-json']) : null
			return { user }
		}
	})

	apolloServer.listen({ port }).then(({ url }) => {
		logger.trace(`thing service gql api ready at ${url}`)
	})

}