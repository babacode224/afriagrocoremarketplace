# AfriAgroCore Marketplace - TODO

## Implemented (Exact Original Files)
- [x] All original frontend pages copied exactly as provided (36 pages)
- [x] Original App.tsx with all routes exactly as provided
- [x] Original index.css with orange (#E85D04) brand theme exactly as provided
- [x] Original main.tsx with CartProvider exactly as provided
- [x] Original CartContext.tsx (localStorage-based cart) exactly as provided
- [x] Original PublicNavbar.tsx exactly as provided
- [x] Original Footer.tsx exactly as provided
- [x] Original NotificationDrawer.tsx exactly as provided
- [x] Original server/db.ts exactly as provided
- [x] Original server/routers.ts exactly as provided
- [x] Original drizzle/schema.ts exactly as provided
- [x] All original test files passing (13 tests)
- [x] Zero TypeScript errors
- [x] Checkpoint saved and ready to publish

## Original Pages Included
- [x] Home.tsx - Landing page with hero, categories, products, how-it-works
- [x] GetStarted.tsx - Role selection page
- [x] Auth.tsx - Authentication page
- [x] Login.tsx - Login page
- [x] FarmerRegister.tsx, FarmerProfileSetup.tsx, FarmerDashboard.tsx
- [x] BuyerRegister.tsx, BuyerProfileSetup.tsx, BuyerDashboard.tsx, BuyerWallet.tsx
- [x] LogisticsRegister.tsx, LogisticsProfileSetup.tsx, LogisticsDashboard.tsx
- [x] StorageRegister.tsx, StorageProfileSetup.tsx, StorageDashboard.tsx
- [x] InputSupplierRegister.tsx, InputSupplierProfileSetup.tsx, InputSupplierDashboard.tsx
- [x] MachineryDealerRegister.tsx, MachineryDealerProfileSetup.tsx, MachineryDealerDashboard.tsx
- [x] ProductListing.tsx, ProductDetail.tsx
- [x] Cart.tsx, Checkout.tsx, OrderConfirmation.tsx, OrderDetails.tsx
- [x] BookLogistics.tsx, BookStorage.tsx
- [x] Messaging.tsx, MachineryMarketplace.tsx
- [x] NotFound.tsx, ComponentShowcase.tsx

## New Features to Implement
- [x] Extended database schema: products, orders, cart, messages, notifications, logistics, storage tables
- [x] Email/password authentication backend (sign up / sign in for all 6 roles)
- [x] Farm Machinery & Tools category (Tractors, Harvesters, Plows, Planters, Tools & Equipment)
- [x] All prices in USD ($)
- [x] Admin account (admin@afriagrocore.com / admin) with full animated dashboard
- [x] Farmer test account (farmer@afriagrocore.com / farmer) with sample data
- [x] Buyer test account (buyer@afriagrocore.com / buyer) with sample data
- [x] Logistics test account (logistics@afriagrocore.com / logistics) with sample data
- [x] Storage test account (storage@afriagrocore.com / storage) with sample data
- [x] Input Supplier test account (supplier@afriagrocore.com / supplier) with sample data
- [x] Machinery Dealer test account (dealer@afriagrocore.com / dealer) with sample data
- [x] Public sign up / sign in pages for all 6 roles (/signin and /signup)
- [x] Real backend API: products CRUD, orders, cart, messages, notifications
- [x] Animated admin dashboard with analytics charts, user management, product approval (/admin)
- [x] Role-specific dashboards with real data (/dashboard)
- [x] Seed script with 16 products, 4 orders, 6 messages, 6 notifications in USD

## Improvements Round 2
- [x] Hero banner: replace farm image with banner.mp4 video (S3 hosted, autoplay, muted, loop)
- [x] Country/State selector: install country-state-city npm package, build reusable components
- [x] Phone input: country dial code selector using npm package
- [x] Profile picture upload: add to all 6 registration forms and dashboard profile settings (S3)
- [x] Remove all Ghana-specific hardcoding from all forms (0 Ghana references remaining)
- [x] USD only: all prices display in USD ($) throughout
- [x] Clean new accounts: new registrations get empty dashboards (no pre-loaded data)

## Signup Flow Refinements (Round 3)
- [x] Fix profile picture upload bug (make it optional, fix S3 endpoint, skippable)
- [x] Remove "Setup Public Profile" post-registration redirect — go directly to Dashboard
- [x] Add "Complete Your Profile" CTA on Dashboard (disappears when profile is complete)
- [x] Move extended profile fields (phone, WhatsApp, social links) to Dashboard Profile Settings
- [x] Delete all 7 test accounts from database (keep products/listings)
- [x] Ensure new accounts are completely clean (no pre-filled data)
- [x] Confirm Farm Machinery & Tools is a full product category across all relevant pages
- [x] Apply all changes to all 6 roles (Farmer, Buyer, Logistics, Storage, Input Supplier, Machinery Dealer)

## Empty State Cleanup (Round 4)
- [x] Fix dashboard stats — show 0 for all counters on new accounts (no shared/global data)
- [x] Fix products section — show empty state with "Add Your First Product" prompt for new sellers
- [x] Fix orders section — show empty state with "No orders yet" for new accounts
- [x] Fix notifications — show empty state (no system-generated welcome notifications)
- [x] Fix profile section — no default bio, avatar, or pre-filled profile fields
- [x] Fix logistics/storage services — show empty state for new logistics/storage providers
- [x] Ensure all 6 roles (Farmer, Buyer, Logistics, Storage, Input Supplier, Machinery Dealer) start clean
- [x] Redirect all legacy role-specific dashboards (/dashboard/farmer, etc.) to unified /dashboard
- [x] Redirect all legacy registration routes (/register/farmer, etc.) to unified /signup
- [x] Update PublicNavbar and GetStarted page to use /signin and /signup routes

## Round 5 — UX & Trust Improvements
- [x] Role pre-selection: pass ?role=farmer from GetStarted to /signup form (auto-selects role on /signup)
- [x] Onboarding checklist on dashboard (role-specific steps, dismissible, persisted in localStorage)
- [x] Email verification: token generation on register, Nodemailer email helper with console fallback
- [x] /verify-email page: handles token from URL, shows success/error/loading states
- [x] resendVerification tRPC procedure: regenerates token and resends email
- [x] Email-not-verified blue banner on dashboard overview with Resend Link button
- [x] Verify Email step as first item in onboarding checklist

## Refactor Phase 1 — Component Cleanup
- [x] Remove admin role from schema, routers, and all frontend references
- [x] Wipe all dummy/test data from database (users, products, orders, notifications, messages, cart, wishlist)
- [x] Delete all legacy role-specific pages from codebase (26 files deleted)
- [x] Remove admin route and admin dashboard from App.tsx and all nav components
- [x] Remove all hardcoded Lorem Ipsum / placeholder content from remaining pages

## Refactor Phase 2 — Unified Auth
- [x] New /signup page: Name + Email (required), Phone (optional), Role dropdown (6 roles, no admin), Google Coming Soon button
- [x] New /signin page: Email + Password, Role selector (if multi-role account), Google Coming Soon button
- [x] Multi-role sign-in: if email has multiple roles, show role selection screen before dashboard
- [x] Remove old multi-step registration flow
- [x] Backend: openId = md5(email:role) for unique multi-role accounts
- [x] Backend: getUsersByEmail for role-selector login flow
- [x] Backend: register checks email+role uniqueness, allows same email for different roles

## Refactor Phase 3 — Dynamic Dashboard & Profile Gate
- [x] Extend DB schema with all role-specific profile fields (farmName, farmerType, companyName, serviceType, facilityName, facilityType, capacity, servicesOffered, serviceArea, productCategories, district)
- [x] Add profileCompleted boolean column to users table
- [x] updateProfile procedure computes profileCompleted=true when all required role-specific fields are filled
- [x] Role-specific ProfileSettings page at /profile-settings with dynamic form fields per role
- [x] /complete-profile route (gated, redirects to /dashboard after completion)
- [x] Auth guard in UserDashboard (redirect to /signin if not authenticated)
- [x] Profile completion gate in UserDashboard (redirect to /complete-profile if profileCompleted=false)
- [x] isProfileComplete uses server-computed profileCompleted flag
- [x] Sidebar Profile Settings item navigates to /profile-settings
- [x] All profile settings navigation buttons use navigate("/profile-settings")

## Password Reset & Profile Banner
- [x] Backend: passwordResetToken + passwordResetExpiresAt columns in users table (via SQL ALTER)
- [x] Backend: requestPasswordReset mutation (generate token, send email, 1-hour expiry, email-enumeration safe)
- [x] Backend: resetPassword mutation (validate token + expiry, update password hash for all roles, clear token)
- [x] Frontend: /forgot-password page (email input, success state, dev-mode reset URL display)
- [x] Frontend: /reset-password page (new password + confirm, match validation, success redirect to /signin)
- [x] Frontend: wire "Forgot password?" link in SignIn to /forgot-password
- [x] Dashboard: persistent but dismissible "Complete Your Profile" banner (per-user localStorage key, X button, auto-hides when profile complete)

## Bug Fix — Signup DB Column Mismatch
- [x] Identified mismatch: schema used snake_case SQL names, database had camelCase column names
- [x] Fixed schema.ts to use camelCase column names matching the actual database
- [x] Added 17 missing columns via SQL ALTER TABLE (farmSize, cropTypes, livestockTypes, etc.)
- [x] Dropped duplicate profile_completed column
- [x] Verified 61 columns in DB match schema exactly
- [x] 0 TypeScript errors, all 13 tests pass

## Round 6 — Flow Testing, Image Upload & SMTP
- [ ] Test full signup-to-dashboard flow (Farmer account) and fix any issues
- [ ] Add S3 product image upload to Add Product form (replace Image URL text input)
- [ ] Wire SMTP secrets for real email delivery (verification + password reset)
