# Implementation Plan: User Authentication

## Overview

Triển khai hệ thống xác thực người dùng với NextAuth.js v5, hỗ trợ đăng nhập bằng email/password, Google OAuth, và Facebook OAuth. Bao gồm xác thực email và reset password.

## Tasks

- [x] 1. Setup NextAuth.js và Database Schema
  - [x] 1.1 Install NextAuth.js và dependencies
    - Install next-auth, @auth/prisma-adapter, nodemailer
    - _Requirements: 1.1, 3.1, 4.1, 5.1_
  - [x] 1.2 Update Prisma schema với User, Account, Session, VerificationToken models
    - Add emailVerified, image fields to User
    - Create Account model for OAuth providers
    - Create Session model
    - Create VerificationToken model
    - _Requirements: 1.1, 4.2, 5.2_
  - [x] 1.3 Run database migration
    - Generate Prisma client
    - Push schema to database
    - _Requirements: 1.1_

- [x] 2. Configure NextAuth.js
  - [x] 2.1 Create auth configuration file (lib/auth.ts)
    - Setup PrismaAdapter
    - Configure session strategy
    - Setup callbacks (signIn, session, jwt)
    - _Requirements: 3.1, 3.3_
  - [x] 2.2 Setup Credentials provider
    - Implement authorize function with bcrypt password verification
    - Handle email/password validation
    - _Requirements: 3.1, 3.2_
  - [x] 2.3 Setup Google OAuth provider
    - Configure Google client ID and secret
    - Handle account linking for existing emails
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [x] 2.4 Setup Facebook OAuth provider
    - Configure Facebook app ID and secret
    - Handle account linking for existing emails
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 2.5 Create NextAuth API route handler
    - Setup /api/auth/[...nextauth]/route.ts
    - Export GET and POST handlers
    - _Requirements: 3.1, 4.1, 5.1_
  - [ ]* 2.6 Write property test for password hashing
    - **Property 1: Password Hashing Security**
    - **Validates: Requirements 1.1**

- [x] 3. Implement Registration API
  - [x] 3.1 Create registration API route (/api/auth/register)
    - Validate email format and uniqueness
    - Validate password requirements (8+ chars, uppercase, lowercase, number)
    - Hash password with bcrypt
    - Create user in database
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  - [x] 3.2 Implement email verification token generation
    - Generate unique token with crypto.randomBytes
    - Set 24-hour expiry
    - Store in VerificationToken table
    - _Requirements: 2.1_
  - [x] 3.3 Setup email service for verification emails
    - Configure nodemailer with SMTP
    - Create email template for verification
    - Send verification email on registration
    - _Requirements: 1.3, 2.1_
  - [ ]* 3.4 Write property test for email uniqueness
    - **Property 2: Email Uniqueness**
    - **Validates: Requirements 1.2**
  - [ ]* 3.5 Write property test for password validation
    - **Property: Password meets requirements**
    - **Validates: Requirements 1.4**

- [x] 4. Implement Email Verification
  - [x] 4.1 Create verify-email API route (/api/auth/verify-email)
    - Validate token exists and not expired
    - Mark user emailVerified with current timestamp
    - Delete used token
    - _Requirements: 2.2, 2.3_
  - [x] 4.2 Create resend verification API route
    - Invalidate existing tokens for user
    - Generate new token
    - Send new verification email
    - _Requirements: 2.4_
  - [x] 4.3 Create email verification page (/auth/verify-email)
    - Handle token from URL
    - Display success/error messages
    - Offer resend option for expired tokens
    - _Requirements: 2.2, 2.3_
  - [ ]* 4.4 Write property test for token expiry
    - **Property 3: Verification Token Expiry**
    - **Validates: Requirements 2.1, 2.3**

- [x] 5. Implement Password Reset
  - [x] 5.1 Create forgot-password API route (/api/auth/forgot-password)
    - Validate email exists
    - Generate reset token with 1-hour expiry
    - Send reset email
    - _Requirements: 7.1_
  - [x] 5.2 Create reset-password API route (/api/auth/reset-password)
    - Validate token exists and not expired
    - Update user password with new hash
    - Delete used token
    - _Requirements: 7.2, 7.3_
  - [x] 5.3 Create forgot password page (/auth/forgot-password)
    - Email input form
    - Success message after submission
    - _Requirements: 7.1_
  - [x] 5.4 Create reset password page (/auth/reset-password)
    - Password input form with validation
    - Handle token from URL
    - Display success/error messages
    - _Requirements: 7.2, 7.3, 7.4_
  - [ ]* 5.5 Write property test for reset token single use
    - **Property 6: Password Reset Token Single Use**
    - **Validates: Requirements 7.3**

- [ ] 6. Checkpoint - Core Auth APIs
  - Ensure all auth APIs work correctly
  - Test registration, login, verification, password reset flows
  - Ask the user if questions arise

- [x] 7. Create Auth UI Components
  - [x] 7.1 Create LoginForm component
    - Email and password inputs
    - Remember me checkbox
    - Error message display
    - Submit handler with signIn
    - _Requirements: 3.1, 3.2, 3.4_
  - [x] 7.2 Create RegisterForm component
    - Name, email, password inputs
    - Password strength indicator
    - Validation error display
    - Submit handler calling register API
    - _Requirements: 1.1, 1.4, 1.5_
  - [x] 7.3 Create SocialLoginButtons component
    - Google sign-in button
    - Facebook sign-in button
    - Divider with "or continue with"
    - _Requirements: 4.1, 5.1_
  - [x] 7.4 Create UserMenu component for Header
    - User avatar/name display
    - Dropdown with My Account, My Orders, Logout
    - _Requirements: 8.1, 8.3_

- [x] 8. Create Auth Pages
  - [x] 8.1 Create login page (/auth/login)
    - LoginForm component
    - SocialLoginButtons component
    - Link to register and forgot password
    - _Requirements: 3.1, 4.1, 5.1_
  - [x] 8.2 Create register page (/auth/register)
    - RegisterForm component
    - SocialLoginButtons component
    - Link to login
    - _Requirements: 1.1_
  - [x] 8.3 Create auth error page (/auth/error)
    - Display error message from query params
    - Link back to login
    - _Requirements: 3.2, 4.1, 5.1_

- [x] 9. Update Header Component
  - [x] 9.1 Add auth state to Header
    - Use useSession hook
    - Conditionally render UserMenu or Login/Register buttons
    - _Requirements: 8.1, 8.2_
  - [x] 9.2 Implement logout functionality
    - Call signOut on logout click
    - Redirect to homepage
    - _Requirements: 6.1, 6.2_

- [x] 10. Create Profile Page
  - [x] 10.1 Create profile page (/account/profile)
    - Display user info (name, email, avatar)
    - Show linked OAuth accounts
    - _Requirements: 9.1, 9.3_
  - [x] 10.2 Implement profile update functionality
    - Edit name form
    - Success/error messages
    - _Requirements: 9.2_
  - [x] 10.3 Implement set password for OAuth users
    - Allow OAuth-only users to set password
    - Enable email/password login
    - _Requirements: 9.4_

- [ ] 11. Checkpoint - Full Auth System
  - Test complete auth flow end-to-end
  - Verify OAuth login with Google and Facebook
  - Test profile management
  - Ensure all tests pass, ask the user if questions arise

- [x] 12. Add Environment Variables Documentation
  - [x] 12.1 Update .env.example with required auth variables
    - NEXTAUTH_URL, NEXTAUTH_SECRET
    - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
    - FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET
    - SMTP settings
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional property-based tests
- NextAuth.js v5 uses the new Auth.js architecture
- OAuth providers require app registration on Google Cloud Console and Facebook Developers
- Email service requires SMTP credentials (Gmail App Password or other SMTP provider)
- Session strategy uses database sessions for better security
