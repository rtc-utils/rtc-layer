export default function UserConnector() {
  return {
    Mutation: {
      async createUser(parent, { name }, ctx, info) {
        const userId = ctx.userId;

        if (!!userId) {
          throw new Error("Cannot create a user when logged in");
        }

        const input = {
          displayName: name,
        };

        const user = await ctx.db.mutation.createUser({ data: input }, info);

        return user;
      }
    }
  };
}
