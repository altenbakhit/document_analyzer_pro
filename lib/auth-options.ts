import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, plan: true, isBlocked: true },
        });
        token.role = dbUser?.role || "user";
        token.plan = dbUser?.plan || "free";
        token.isBlocked = dbUser?.isBlocked || false;
      }
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, plan: true, isBlocked: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.plan = dbUser.plan;
          token.isBlocked = dbUser.isBlocked;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.plan = token.plan as string;
        session.user.isBlocked = token.isBlocked as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
