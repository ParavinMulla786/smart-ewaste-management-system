# Password Reset on First Login Implementation

## Overview
This implementation forces pickup persons to reset their temporary password on first login for security purposes.

## Changes Made

### Backend Changes

#### 1. PickupPerson Entity
**File**: `smart-ewaste-backend/src/main/java/com/ewaste/model/PickupPerson.java`
- Added `isTemporaryPassword` boolean field to track if the password needs to be changed
- Default value is `false`

#### 2. PickupPersonService
**File**: `smart-ewaste-backend/src/main/java/com/ewaste/service/PickupPersonService.java`
- Modified `registerPickupPerson()` to set `isTemporaryPassword = true` when creating new pickup persons
- Added `resetPassword()` method to:
  - Verify current password
  - Validate new password (min 6 characters, different from old)
  - Update password with BCrypt encryption
  - Clear the `isTemporaryPassword` flag

#### 3. AuthController
**File**: `smart-ewaste-backend/src/main/java/com/ewaste/controller/AuthController.java`
- Modified login response for pickup persons to include `isTemporaryPassword` flag
- Updated `AdminLoginResponse` class to support optional `isTemporaryPassword` field
- Only sent for PICKUP_PERSON role logins

#### 4. PickupPersonController
**File**: `smart-ewaste-backend/src/main/java/com/ewaste/controller/PickupPersonController.java`
- Added `/api/pickup-persons/reset-password` POST endpoint
- Accepts: email, oldPassword, newPassword
- Returns success message with updated user data

#### 5. ResetPasswordRequest DTO
**File**: `smart-ewaste-backend/src/main/java/com/ewaste/dto/ResetPasswordRequest.java`
- New DTO for password reset requests
- Contains: email, oldPassword, newPassword with validation

### Frontend Changes

#### 1. PasswordReset Component
**File**: `smart-ewaste-frontend/src/components/auth/PasswordReset.jsx`
- New component for password reset form
- Validates:
  - Current password is provided
  - New password is at least 6 characters
  - New password is different from current
  - Passwords match
- Calls `/api/pickup-persons/reset-password` endpoint
- Redirects to login after successful reset

#### 2. AuthContext
**File**: `smart-ewaste-frontend/src/context/AuthContext.jsx`
- Added `isTemporaryPassword` to state
- Modified `login()` function to accept and store temporary password flag
- Persists flag to localStorage
- Modified `logout()` to clear the flag

#### 3. Login Component
**File**: `smart-ewaste-frontend/src/components/auth/Login.jsx`
- Extracts `isTemporaryPassword` from login response
- Passes flag to AuthContext login function
- Checks if pickup person has temporary password
- Redirects to `/reset-password` if temporary password detected
- Only affects PICKUP_PERSON role

#### 4. App Routes
**File**: `smart-ewaste-frontend/src/App.jsx`
- Added `/reset-password` route for PasswordReset component
- Route is publicly accessible (required for password reset flow)

## Workflow

### 1. Admin Registers Pickup Person
1. Admin creates new pickup person with temporary password
2. System sets `isTemporaryPassword = true`
3. Pickup person receives credentials via email

### 2. First Login
1. Pickup person enters email and temporary password
2. System authenticates and returns login response with `isTemporaryPassword: true`
3. Frontend detects temporary password flag
4. User is redirected to `/reset-password` instead of dashboard

### 3. Password Reset
1. User enters:
   - Current (temporary) password
   - New password (min 6 characters)
   - Confirm new password
2. System validates:
   - Current password is correct
   - New password meets requirements
   - New password is different from temporary
3. Password is updated and `isTemporaryPassword` flag is cleared
4. User is logged out and redirected to login page

### 4. Subsequent Logins
1. Pickup person logs in with new password
2. `isTemporaryPassword: false` in response
3. User proceeds directly to dashboard

## Security Features

1. **Password Validation**:
   - Minimum 6 characters
   - Must be different from temporary password
   - BCrypt encryption

2. **Forced Reset**:
   - Cannot access dashboard with temporary password
   - Must reset before using system

3. **Session Management**:
   - After reset, user must login again with new credentials
   - Ensures password is properly validated

## API Endpoints

### POST `/api/pickup-persons/reset-password`
**Request Body**:
```json
{
  "email": "pickup@example.com",
  "oldPassword": "TempPass123",
  "newPassword": "NewSecurePass456"
}
```

**Success Response (200)**:
```json
{
  "message": "Password reset successfully",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "isTemporaryPassword": false
  }
}
```

**Error Response (400)**:
```json
{
  "error": "Current password is incorrect"
}
```

## Testing Checklist

- [ ] Create new pickup person and verify `isTemporaryPassword = true` in database
- [ ] Login with temporary password and verify redirect to reset page
- [ ] Reset password with invalid old password (should fail)
- [ ] Reset password with new password same as old (should fail)
- [ ] Reset password with new password less than 6 characters (should fail)
- [ ] Reset password successfully and verify flag cleared in database
- [ ] Login again with new password and verify redirect to dashboard
- [ ] Verify regular users and admins are not affected by this flow

## Notes

- This feature only affects PICKUP_PERSON role
- Regular users and admins are unaffected
- The password reset page is accessible without authentication (needed for the flow)
- After reset, the user must login again to ensure proper validation
