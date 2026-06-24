import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const cleanEmail = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findFirst({
          where: { email: { equals: cleanEmail, mode: "insensitive" } },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password.trim(), user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.avatar };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "talentdz-secret-2024",
});

export { handler as GET, handler as POST };
