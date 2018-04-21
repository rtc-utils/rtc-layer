import { GraphQLServer } from "graphql-yoga";
import { Prisma } from "prisma-binding";
import UserConnector from './connectors/userConnector';
import TwilioConnector from "./connectors/twilioConnector";

const User = UserConnector();
const Twilio = TwilioConnector({});

const resolvers = {
  Query: {
    conferenceRooms(parent, args, ctx, info) {},
    conferenceRoom(parent, args, ctx, info) {},
    messages(parent, { id }, ctx, info) {},
    ...User.Query,
    ...Twilio.Query
  },
  Mutation: {
    addMessage(parent, args, ctx, info) {},
    ...User.Mutation,
    ...Twilio.Mutation
  }
};

function createContext(httpReq) {
  return {
    db: new Prisma({
      typeDefs: "src/generated/prisma.graphql",
      endpoint: "https://us1.prisma.sh/public-plumviper-393/rtc-layer/dev", // the endpoint of the Prisma DB service
      secret: "mysecret123", // specified in database/prisma.yml
      debug: true // log all GraphQL queryies & mutations
    }),
    userId: httpReq.request.headers && httpReq.request.headers.userid,
    ...httpReq,
  };
}


const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: createContext,
});

server.start(() => console.log("Server is running on http://localhost:4000"));
