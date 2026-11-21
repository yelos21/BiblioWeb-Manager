import { betterAuth, email } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";


export const auth = betterAuth({
     database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {enabled: true},
  user: {
    additionalFields:{
        activo: {
            type: "boolean", defaultValue: true, input: false
        },
        rolId:{type: "number", required:false, input: false}
    },
  },

});
