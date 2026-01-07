# Design Document: User Authentication

## Overview

Hệ thống xác thực người dùng sử dụng NextAuth.js v5 (Auth.js) để quản lý authentication với các provider: Credentials (email/password), Google OAuth, và Facebook OAuth. Hệ thống tích hợp với Prisma và MongoDB để lưu trữ user data, sessions, và verification tokens.

## Architecture

```mermaid
graph TB
    subgraph Client
        UI[Login/Register UI]
        Header[Header Component]
        Profile[Profile Page]
    end
    
    subgraph NextAuth
        Auth[Auth.js Config]
        Providers[OAuth Providers]
        Callbacks[Auth Callbacks]
    end
    
    subgraph API
        AuthAPI[/api/auth/*]
        RegisterAPI[/api/auth/register]
        VerifyAPI[/api/auth/verify-email]
        ResetAPI[/api/auth/reset-password]
    end
    
    subgraph Database
        User[User Model]
        Account[Account Model]
        Session[Session Model]
        Token[VerificationToken Model]
    end
    
    subgraph External
        Google[Google OAuth]
        Facebook[Facebook OAuth]
        Email[Email Service]
    end
    
    UI --> AuthAPI
    UI --> RegisterAPI
    Header --> Auth
    Profile --> Auth
    
    AuthAPI --> Auth
    Auth --> Providers
    Auth --> Callbacks
    Providers --> Google
    Providers --> Facebook
    
    Callbacks --> User
    Callbacks --> Account
    Callbacks --> Session
    
    RegisterAPI --> User
    RegisterAPI --> Token
    RegisterAPI --> Email
    
    VerifyAPI --> Token
    VerifyAPI --> User
    
    ResetAPI --> Token
    ResetAPI --> User
    ResetAPI --> Email
```

## Components and Interfaces

### 1. NextAuth Configuration

```typescript
// lib/auth.ts
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate and return user
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle account linking
    },
    async session({ session, user }) {
      // Add user id to session
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  }
})
```

### 2. API Routes

```typescript
// app/api/auth/register/route.ts
interface RegisterRequest {
  email: string
  password: string
  name: string
}

interface RegisterResponse {
  success: boolean
  message: string
  userId?: string
}

// app/api/auth/verify-email/route.ts
interface VerifyEmailRequest {
  token: string
}

// app/api/auth/reset-password/route.ts
interface ResetPasswordRequest {
  email: string
}

interface ResetPasswordConfirmRequest {
  token: string
  password: string
}
```

### 3. UI Components

```typescript
// components/auth/LoginForm.tsx
interface LoginFormProps {
  callbackUrl?: string
}

// components/auth/RegisterForm.tsx
interface RegisterFormProps {
  onSuccess?: () => void
}

// components/auth/SocialLoginButtons.tsx
interface SocialLoginButtonsProps {
  callbackUrl?: string
}

// components/auth/UserMenu.tsx
interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}
```

## Data Models

### Updated Prisma Schema

```prisma
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  password      String?   // Hashed, null for OAuth-only users
  role          String    @default("user")
  accounts      Account[]
  sessions      Session[]
  orders        Order[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String  @db.ObjectId
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  sessionToken String   @unique
  userId       String   @db.ObjectId
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String   // email
  token      String   @unique
  type       String   // 'email-verification' | 'password-reset'
  expires    DateTime
  createdAt  DateTime @default(now())

  @@unique([identifier, token])
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Password Hashing Security
*For any* password submitted during registration, the stored password hash SHALL NOT be equal to the original password, and bcrypt.compare(original, hash) SHALL return true.
**Validates: Requirements 1.1**

### Property 2: Email Uniqueness
*For any* registration attempt with an email that already exists in the database, the system SHALL reject the registration and return an error.
**Validates: Requirements 1.2**

### Property 3: Verification Token Expiry
*For any* verification token, if the current time exceeds token.expires, the token SHALL be considered invalid and verification SHALL fail.
**Validates: Requirements 2.1, 2.3**

### Property 4: Session Validity
*For any* authenticated request, if session.expires is in the past, the request SHALL be treated as unauthenticated.
**Validates: Requirements 3.3**

### Property 5: OAuth Account Linking
*For any* OAuth sign-in where the email matches an existing user, the OAuth account SHALL be linked to the existing user rather than creating a duplicate.
**Validates: Requirements 4.3, 5.3**

### Property 6: Password Reset Token Single Use
*For any* password reset token, after successful password reset, the token SHALL be invalidated and cannot be reused.
**Validates: Requirements 7.3**

## Error Handling

| Error Code | Description | User Message |
|------------|-------------|--------------|
| AUTH_EMAIL_EXISTS | Email already registered | "This email is already registered. Please login or use a different email." |
| AUTH_INVALID_CREDENTIALS | Wrong email/password | "Invalid email or password. Please try again." |
| AUTH_TOKEN_EXPIRED | Verification/reset token expired | "This link has expired. Please request a new one." |
| AUTH_TOKEN_INVALID | Invalid token | "Invalid verification link. Please request a new one." |
| AUTH_OAUTH_ERROR | OAuth provider error | "Unable to sign in with {provider}. Please try again." |
| AUTH_EMAIL_NOT_VERIFIED | Email not verified (for sensitive actions) | "Please verify your email address first." |
| AUTH_PASSWORD_WEAK | Password doesn't meet requirements | "Password must be at least 8 characters with uppercase, lowercase, and number." |

## Testing Strategy

### Unit Tests
- Password validation function
- Token generation and validation
- Email format validation
- Session expiry calculation

### Property-Based Tests
- Property 1: Password hashing (bcrypt round-trip)
- Property 2: Email uniqueness constraint
- Property 3: Token expiry validation
- Property 5: OAuth account linking logic

### Integration Tests
- Full registration flow
- Email verification flow
- OAuth sign-in flow
- Password reset flow
- Session management

### E2E Tests
- User registration and login journey
- OAuth login with Google/Facebook
- Password reset journey
- Profile update journey

## Environment Variables Required

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Email Service (for verification emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@jamessaxcorner.com
```

## Security Considerations

1. **Password Storage**: Use bcrypt with cost factor 12 for password hashing
2. **CSRF Protection**: NextAuth handles CSRF tokens automatically
3. **Session Security**: HTTP-only cookies, secure flag in production
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **Token Security**: Use crypto.randomBytes for token generation
6. **OAuth State**: NextAuth handles OAuth state parameter automatically
