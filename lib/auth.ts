import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { NextAuthConfig, Provider } from "next-auth"

// Build providers array dynamically based on available credentials
const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required")
      }

      const email = credentials.email as string
      const password = credentials.password as string

      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user || !user.password) {
        throw new Error("Invalid email or password")
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        throw new Error("Invalid email or password")
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      }
    }
  })
]

// Only add Google provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

// Only add Facebook provider if credentials are configured
if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  providers.push(
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers,

  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth sign-in
      if (account?.provider !== "credentials") {
        return true
      }
      
      // For credentials, check if email is verified (optional)
      // You can enable this check if you want to require email verification
      // const existingUser = await prisma.user.findUnique({
      //   where: { id: user.id }
      // })
      // if (!existingUser?.emailVerified) {
      //   return false
      // }
      
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "user"
      }
      
      // Handle OAuth account linking
      if (account && user) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })
        if (existingUser) {
          token.id = existingUser.id
          token.role = existingUser.role
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  events: {
    async linkAccount({ user }) {
      // When OAuth account is linked, mark email as verified
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
  debug: process.env.NODE_ENV === "development",
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
