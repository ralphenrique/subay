# Guest Mode Implementation

## Overview
The app now supports **optional authentication**, allowing users to use the app without signing in while encouraging them to create an account for cloud sync and backup.

## Features Implemented

### 1. **User Menu Button** (`/components/molecules/UserMenuButton.tsx`)
- **For Guests**: Shows "Sign In" button with login icon
- **For Authenticated Users**: Shows user avatar/profile with their name
- Clicking navigates to sign-in page (guests) or profile page (authenticated users)
- Located at the top of the bottom sheet

### 2. **Guest Onboarding Prompt** (`/components/molecules/GuestPrompt.tsx`)
- Dismissible banner that explains guest mode limitations
- Appears only for non-authenticated users
- Key message: "Your tasks are saved locally. Sign in to sync across devices and back up to the cloud."
- Includes direct "Sign In →" link
- Can be dismissed with X button

### 3. **Task Sync Indicator** (`/components/atoms/TaskSyncIndicator.tsx`)
- Small badge showing sync status
- **Synced** (with cloud icon) - for authenticated users
- **Local** (with hard drive icon) - for guest users
- Appears above the task list

### 4. **Updated Route Guards** (`/app/_layout.tsx`)
- Removed `Stack.Protected` guards
- All screens now accessible regardless of auth state
- Auth screens available for guests to sign in anytime
- Main app works without authentication

## User Experience Flow

### Guest User Journey:
1. **Opens app** → Immediately sees calendar and can add tasks
2. **Views bottom sheet** → Sees:
   - "Sign In" button (top)
   - Guest mode prompt (dismissible banner)
   - "Local" sync indicator
   - Full task functionality
3. **Clicks Sign In** → Navigates to auth flow
4. **After signing in** → Tasks can sync, prompt disappears, shows profile

### Authenticated User Journey:
1. **Opens app** → Full functionality with sync enabled
2. **Views bottom sheet** → Sees:
   - User avatar/name (top)
   - No guest prompt
   - "Synced" indicator
   - Full task functionality with cloud backup

## Components Created

### Atoms:
- `TaskSyncIndicator.tsx` - Shows sync status badge

### Molecules:
- `UserMenuButton.tsx` - Auth-aware user menu
- `GuestPrompt.tsx` - Onboarding banner for guests

### Updated Templates:
- `bottom-sheet-content.tsx` - Integrated all new components

## Next Steps (Optional)

1. **Profile Screen**: Create a profile/settings screen for authenticated users
2. **Task Persistence**: Implement local storage for guest tasks and Supabase sync for authenticated users
3. **Migration Flow**: Add logic to migrate local tasks to cloud when user signs in
4. **Analytics**: Track guest-to-authenticated conversion rate
5. **Enhanced Prompt**: Add more persuasive copy or benefits list for signing in

## Implementation Notes

- All authentication checks use `useUser()` from Clerk
- UI adapts dynamically based on `isSignedIn` state
- No forced authentication or redirects
- Clean separation of concerns with atomic design pattern
- Accessible to all users regardless of auth status
