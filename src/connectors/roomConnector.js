import { jwt } from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET
} from "../config";
import twilioClient from "./twilioClient";

const { AccessToken } = jwt;
const { VideoGrant } = AccessToken;

export default function RoomConnector() {
  return {
    Query: {
      conferenceRooms: async (parent, {}, context, info) => {
        return await context.db.query.conferenceRooms({}, info)
      },
      conferenceRoom: async (parent, { conferenceRoomId }, context, info) => {
        return await context.db.query.conferenceRooms({
          where: {
            id: conferenceRoomId
          }
        }, info)
      },
      usersInConferenceRoom: async (parent, { conferenceRoomId }, context, info) => {
        const room = await context.db.query.conferenceRooms({
          where: {
            id: conferenceRoomId
          }
        }, info);

        return room.conferenceRooms.users;
      }
    },
    Mutation: {
      addMessage: async (parent, { text, conferenceRoomId }, context, info) => {
        const userId = context && context.userId;

        if (!userId) {
          throw new Error("Must be logged in, to connect to conference rooms");
        }

        const userObject = await context.db.query.user({ where: { id: userId } });

        const update = {
          text,
          conferenceRoomId,
          createdBy: {
            connect: {
              id: userObject.id,
            },
          },
        };

        return context.db.mutation.createMessage({ data: update }, info);
      },
      addUserToConference: async (parent, { userId, conferenceRoomId }, context, info) => {
        const room = await context.db.query.conferenceRooms({
          where: {
            id: conferenceRoomId
          }
        }, info);

        if (context.userId !== room.createdBy && context.userId !== userId) {
          throw new Error("Only the room creator can add users other than themselves");
        }

        const result = await context.db.mutation.updateConferenceRoom({
          data: {
            users: {
              connect: [{ id: userId }]
            }
          },
          where: {
            id: conferenceRoomId
          }
        }, info)

        return true
      },
      removeUserFromConference: async (parent, { userId, conferenceRoomId }, context, info) => {
        const room = await context.db.query.conferenceRooms({
          where: {
            id: conferenceRoomId
          }
        }, info);

        if (context.userId !== room.createdBy && context.userId !== userId) {
          throw new Error("Only the room creator can remove users other than themselves");
        }

        const result = await context.db.mutation.updateConferenceRoom({
          data: {
            users: {
              disconnect: [{ id: userId }]
            }
          },
          where: {
            id: conferenceRoomId
          }
        }, info)

        return true
      },
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
      createConferenceRoom: async (
        parent,
        { data: { title, users = [], messages = [] } },
        context,
        info
      ) => {
        const userId = context && context.userId;

        if (!userId) {
          throw new Error("Must be logged in, to create conference rooms");
        }

        const user = await context.db.query.user({ where: { id: userId } });

        if (!user) throw new Error("Authenticated user was not found");

        const connectIds = users.map(({ id }) => {
          return { id };
        });

        return await context.db.mutation.createConferenceRoom(
          {
            data: {
              title,
              createdBy: userId,
              messages: messages,
              participants: users
            }
          },
          info
        );
      }
    }
  };
}
