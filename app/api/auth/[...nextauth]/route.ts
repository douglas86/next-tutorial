import NextAuth, { AuthOptions, Session } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/app/lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session }: { session: Session }): Promise<Session> {
      return session;
    },
    async signIn(): Promise<boolean> {
      return true;
    },
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_APP_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.NEXT_APP_GOOGLE_SECRET_KEY || "",
    }),
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
