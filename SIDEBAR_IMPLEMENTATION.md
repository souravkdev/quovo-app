# Sidebar Navigation System - Role-Based Implementation

## Overview
Replaced the duplicate top navbar with a modern, collapsible sidebar navigation system featuring role-based access control based on user subscription plans.

## Changes Made

### 1. **New Sidebar Component** (`components/Sidebar.tsx`)
- **Collapsible Design**: Sidebar collapses on mobile, stays fixed on desktop
- **Role-Based Menus**: Different menu items appear based on plan:
  - **Free Plan**: Dashboard, New Brief
  - **Pro Plan**: + AI Chat, Analytics
  - **Agency Plan**: + Team, Integrations
- **User Profile Section**: 
  - Avatar/initials display
  - User name and email
  - Plan badge with icon
  - Quick upgrade links
  - Logout button
- **Navigation Items**: Dashboard, New Brief, AI Chat, Analytics, Team, Integrations
- **Footer Links**: Settings, Help
- **Mobile Support**: Hamburger menu with overlay

### 2. **Updated Navbar** (`components/Navbar.tsx`)
- Now hides in app pages where sidebar is present
- Shows only on public pages (home, pricing, etc.)
- Reduced to minimal branding and auth links

### 3. **Updated Root Layout** (`app/layout.tsx`)
- Added sidebar import and rendering
- Main content now has left margin (`md:ml-64`) for desktop sidebar
- Sidebar positioning is fixed

### 4. **Cleaned Up Dashboard** (`app/dashboard/page.tsx`)
- Removed duplicate header
- Now relies on sidebar for navigation
- Better spacing with sidebar layout

### 5. **Updated Brief Pages**
- **New Brief** (`app/brief/new/page.tsx`): Removed duplicate header
- **Brief Detail** (`app/brief/[slug]/page.tsx`): Removed duplicate header

### 6. **New Utility Function** (`lib/utils.ts`)
- Added `cn()` utility for conditional class names
- Simple implementation without external dependencies

### 7. **New Pages Created**
- **Settings** (`app/settings/page.tsx`): Account preferences, notifications
- **Profile** (`app/profile/page.tsx`): User profile display
- **Analytics** (`app/analytics/page.tsx`): Pro plan dashboard (placeholder)
- **Team** (`app/team/page.tsx`): Agency plan team management (placeholder)
- **Integrations** (`app/integrations/page.tsx`): Agency plan integrations (placeholder)
- **Help** (`app/help/page.tsx`): Support and documentation

## Role-Based Access

### Free Plan
✓ Dashboard  
✓ New Brief  
✓ Profile  
✓ Settings  
✓ Help  

### Pro Plan
✓ All Free features  
✓ AI Chat  
✓ Analytics  
✓ Upgrade prompt to Agency  

### Agency Plan
✓ All Pro features  
✓ Team Management  
✓ Integrations  
✓ No upgrade prompts  

## UI Features

### Sidebar
- **Fixed Position**: 256px (64 units) width on desktop
- **Collapsible**: Hamburger menu on mobile
- **Responsive**: Full-width mobile drawer with overlay
- **Dark Theme**: Matches Quovo branding (slate-950, indigo accents)
- **Smooth Animations**: Transitions and hover effects

### User Menu
- **Plan Badge**: Color-coded (Purple for Agency, Blue for Pro, Gray for Free)
- **Plan Icon**: Crown for Agency, Zap for Pro
- **Quick Links**: View Profile, Settings, Upgrade options
- **Logout**: Red-themed logout button

### Navigation Items
- **Icons**: From lucide-react library
- **Active State**: Indigo highlight for current page
- **Badges**: "NEW" badge on AI Chat
- **Hover Effects**: Background color change on hover

## Technical Details

### Dependencies
- `lucide-react`: Icon library (newly installed)
- `axios`: API calls (already installed)
- Tailwind CSS: Styling (already installed)

### Component Structure
```
layout.tsx
├── Navbar (hidden in app pages)
├── Sidebar (fixed on desktop, collapsible on mobile)
└── main content
    ├── Dashboard
    ├── New Brief
    ├── AI Chat
    ├── Analytics
    ├── Team
    ├── Integrations
    ├── Settings
    ├── Profile
    └── Help
```

### State Management
- User data fetched from `/users/me/` API endpoint
- Plan determines visible menu items
- Dropdown menu for user options
- Mobile menu toggle state

## Known Behaviors
- Navbar hidden on: `/dashboard`, `/brief/*`, `/ai/*`, `/pricing`, `/settings`
- Sidebar appears on all logged-in app pages
- Mobile menu auto-closes on navigation
- Plan badges show upgrade options for free/pro users

## Future Enhancements
- Search functionality in sidebar
- Keyboard shortcuts for sidebar navigation
- Side-by-side brief and chat view (for pro/agency)
- Custom theme colors in sidebar
- Sidebar width customization
