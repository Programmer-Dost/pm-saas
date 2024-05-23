import NextAuth from "next-auth";

import GitHub from "next-auth/providers/github";

import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient, UserRole } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { getUserbyEmail } from "./lib/user";
import { getTwoFactorConfirmationByUserId } from "./lib/data/two-fa-confirmation";
const prisma = new PrismaClient().$extends(withAccelerate());
export const config = {
  theme: {
    logo: "https://next-auth.js.org/img/logo/logo-sm.png",
  },
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("auth called");
        let user = await prisma.user.findUnique({
          where: { email: credentials.username as string },
        });
        console.log({ user });
        if (user && user.password === credentials.password) {
          console.log("User here");
          return { ...user, randomKey: "random fingerprint" };
        }
        console.log("reached here");
        return null;
        // else if (!user) {
        //   try {
        //     let newUser = await prisma.user.create({
        //       data: {
        //         email: credentials.username as string,
        //         password: credentials.password as string,
        //       },
        //       select: {
        //         name: true,
        //         email: true,
        //         password: true,
        //       },
        //     });
        //     return newUser;
        //   } catch (err) {
        //     console.log(err);
        //   }
        // }
      },
    }),
  ],
  debug: true,
  basePath: "/api/auth",
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log({ user, account });
      if (account?.provider !== "credentials") return true;
      const existingUser = await getUserbyEmail(user.email as string);
      if (!existingUser?.emailVerified) return false;

      if (existingUser.isTwoFactorEnabled){
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)
        // console.log({  twoFactorConfirmation }, "Two Factor Confirmation");
        if(!twoFactorConfirmation) return false;
        await prisma.twoFactorConfirmation.delete({where:{
          id:twoFactorConfirmation.id,
        }})
      }
      console.log("returning true")
      return true;
    },
    async session({ session, token }) {
      console.log({ session, token });
      // if (token.role && session.user) {
      //   session.user.role = token.role as UserRole;
      // }
      return {
        ...session,
        id: token.id,
        randomKey: token.randomKey,
        user: {
          ...session.user,

          role: token.role,
        },
      };
    },
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;
      if (pathname === "/daily-tasks") return !!auth;
      return true;
    },
    jwt({ token, trigger, session, user }) {
      if (trigger === "update") token.name = session.user.name;
      console.log({ user }, "jwt");
      const u = user as unknown as any;

      if (user) {
        return {
          ...token,
          id: u.id,
          randomKey: u.randomKey,
          role: u.role,
        };
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // error: "/auth/error"
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
