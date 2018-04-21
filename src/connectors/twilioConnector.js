import { jwt } from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET
} from "../config";

const { AccessToken } = jwt;
const { VideoGrant } = AccessToken;

export default function TwilioConnector() {
  return {
    Query: {},
    Mutation: {
      initializeConnectedUser: (parent, args, context, info) => {
        const userId = context && context.userId;

        if (!userId) {
          throw new Error("Must be logged in, to connect to conference rooms");
        }

        // take their userId and look them up in the DB to get their display name
        const token = new AccessToken(
          TWILIO_ACCOUNT_SID,
          TWILIO_API_KEY,
          TWILIO_API_SECRET
        );

        token.identity = userId;

        const grant = new VideoGrant();
        token.addGrant(grant);

        return {
          identity: userId,
          token: token.toJwt()
        };
      },
      createConferenceRoom: async (parent, { title, users=[], messages=[] }, context, info) => {
        const userId = context && context.userId;

        if (!userId) {
          throw new Error("Must be logged in, to create conference rooms");
        }

        const user = await context.db.query.user({ where: { id: userId }})

        if (!user) throw new Error("Authenticated user was not found");

        const conferenceRoom = await context.db.mutation.createConferenceRoom({
          data: {
            title,
            messages: messages,
            users: [user].concat(users),
          }
        })

        return conferenceRoom
      }
    }
  };
}
