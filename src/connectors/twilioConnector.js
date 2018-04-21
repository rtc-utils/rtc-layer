import { jwt } from "twilio";

const { AccessToken } = jwt;
const { VideoGrant } = AccessToken;

export default function TwilioConnector({
  TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY = process.env.TWILIO_API_KEY,
  TWILIO_API_SECRET = process.env.TWILIO_API_SECRET
}) {
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
      }
    }
  };
}
