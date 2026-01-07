# Requirements Document

## Introduction

Hệ thống xác thực người dùng cho phép khách hàng đăng ký, đăng nhập bằng email/password hoặc qua các nhà cung cấp OAuth (Google, Facebook), và xác thực tài khoản qua email. Hệ thống sử dụng NextAuth.js để quản lý authentication.

## Glossary

- **Auth_System**: Hệ thống xác thực người dùng sử dụng NextAuth.js
- **User**: Người dùng đã đăng ký tài khoản
- **OAuth_Provider**: Nhà cung cấp xác thực bên thứ ba (Google, Facebook)
- **Verification_Token**: Mã xác thực gửi qua email để xác nhận tài khoản
- **Session**: Phiên đăng nhập của người dùng
- **Account**: Liên kết giữa User và OAuth Provider

## Requirements

### Requirement 1: Đăng ký tài khoản bằng Email

**User Story:** As a visitor, I want to register an account with my email and password, so that I can access member features.

#### Acceptance Criteria

1. WHEN a visitor submits registration form with valid email and password, THE Auth_System SHALL create a new User account with hashed password
2. WHEN a visitor submits registration form with an existing email, THE Auth_System SHALL display an error message "Email already exists"
3. WHEN a new account is created, THE Auth_System SHALL send a verification email to the user's email address
4. THE Auth_System SHALL require password to be at least 8 characters with at least one uppercase, one lowercase, and one number
5. IF password does not meet requirements, THEN THE Auth_System SHALL display specific validation errors

### Requirement 2: Xác thực Email

**User Story:** As a new user, I want to verify my email address, so that I can confirm my account ownership.

#### Acceptance Criteria

1. WHEN a verification email is sent, THE Auth_System SHALL include a unique verification link valid for 24 hours
2. WHEN a user clicks a valid verification link, THE Auth_System SHALL mark the account as verified and redirect to login page
3. IF a verification link has expired, THEN THE Auth_System SHALL display an error and offer to resend verification email
4. WHEN a user requests to resend verification email, THE Auth_System SHALL invalidate previous tokens and send a new verification email
5. WHILE an account is unverified, THE Auth_System SHALL allow login but display a reminder to verify email

### Requirement 3: Đăng nhập bằng Email/Password

**User Story:** As a registered user, I want to login with my email and password, so that I can access my account.

#### Acceptance Criteria

1. WHEN a user submits valid email and password, THE Auth_System SHALL create a session and redirect to the previous page or homepage
2. IF email or password is incorrect, THEN THE Auth_System SHALL display "Invalid email or password" error
3. THE Auth_System SHALL maintain session for 30 days unless user logs out
4. WHEN a user clicks "Remember me", THE Auth_System SHALL extend session duration to 90 days

### Requirement 4: Đăng nhập bằng Google

**User Story:** As a visitor, I want to login with my Google account, so that I can quickly access the site without creating a new password.

#### Acceptance Criteria

1. WHEN a user clicks "Continue with Google", THE Auth_System SHALL redirect to Google OAuth consent screen
2. WHEN Google authentication succeeds, THE Auth_System SHALL create or link account and create session
3. IF Google account email already exists as email/password account, THEN THE Auth_System SHALL link the Google account to existing user
4. WHEN a new user signs in with Google, THE Auth_System SHALL mark email as verified automatically

### Requirement 5: Đăng nhập bằng Facebook

**User Story:** As a visitor, I want to login with my Facebook account, so that I can quickly access the site without creating a new password.

#### Acceptance Criteria

1. WHEN a user clicks "Continue with Facebook", THE Auth_System SHALL redirect to Facebook OAuth consent screen
2. WHEN Facebook authentication succeeds, THE Auth_System SHALL create or link account and create session
3. IF Facebook account email already exists as email/password account, THEN THE Auth_System SHALL link the Facebook account to existing user
4. WHEN a new user signs in with Facebook, THE Auth_System SHALL mark email as verified automatically

### Requirement 6: Đăng xuất

**User Story:** As a logged-in user, I want to logout, so that I can secure my account on shared devices.

#### Acceptance Criteria

1. WHEN a user clicks logout, THE Auth_System SHALL destroy the session and redirect to homepage
2. WHEN a user logs out, THE Auth_System SHALL clear all session cookies

### Requirement 7: Quên mật khẩu

**User Story:** As a user who forgot my password, I want to reset it, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user requests password reset with valid email, THE Auth_System SHALL send a reset link valid for 1 hour
2. WHEN a user clicks a valid reset link, THE Auth_System SHALL display password reset form
3. WHEN a user submits new password, THE Auth_System SHALL update password and invalidate reset token
4. IF reset link has expired, THEN THE Auth_System SHALL display error and offer to request new link

### Requirement 8: Hiển thị trạng thái đăng nhập

**User Story:** As a user, I want to see my login status in the header, so that I know if I'm logged in.

#### Acceptance Criteria

1. WHILE a user is logged in, THE Header SHALL display user avatar/name and dropdown menu
2. WHILE a user is not logged in, THE Header SHALL display "Login" and "Register" buttons
3. WHEN a user clicks their avatar, THE Header SHALL show dropdown with "My Account", "My Orders", and "Logout" options

### Requirement 9: Trang Profile

**User Story:** As a logged-in user, I want to view and edit my profile, so that I can manage my account information.

#### Acceptance Criteria

1. WHEN a logged-in user visits profile page, THE Auth_System SHALL display user information (name, email, linked accounts)
2. WHEN a user updates their name, THE Auth_System SHALL save changes and display success message
3. WHEN a user has OAuth accounts linked, THE Auth_System SHALL display which providers are connected
4. IF a user only has OAuth login, THEN THE Auth_System SHALL allow them to set a password for email login
