const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')

const resolvers = {
  Query: {
    conferenceRooms(parent, args, ctx, info) {},
    conferenceRoom(parent, args, ctx, info) {},
    messages(parent, { id }, ctx, info) {},
    users(parent, args, ctx, info) {},
    user(parent, args, ctx, info) {},
  },
  Mutation: {
    addMessage(parent, args, ctx, info) {},
  }
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'https://us1.prisma.sh/public-plumviper-393/rtc-layer/dev', // the endpoint of the Prisma DB service
      secret: 'mysecret123', // specified in database/prisma.yml
      debug: true, // log all GraphQL queryies & mutations
    }),
  }),
})

server.start(() => console.log('Server is running on http://localhost:4000'))
