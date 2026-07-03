import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { db } from "./db";

// SSO: Google + GitHub OAuth via NextAuth. Add more providers as needed.
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  providers: [
    GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID ?? "", clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "" }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "read:user user:email repo" } }, // repo scope powers GitHub analytics + AI code review
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      (session.user as any).id = user.id;
      (session.user as any).role = (user as any).role;
      return session;
    },
  },
};
export const auth = () => getServerSession(authOptions);

/** Route-handler helper: returns the user or throws 401. */
export async function requireUser() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  return user;
}
