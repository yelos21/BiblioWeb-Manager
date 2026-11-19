import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { Prisma } from "@prisma/client/extension";



export const auth = betterAuth{
     database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

}
