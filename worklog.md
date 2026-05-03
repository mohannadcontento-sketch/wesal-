# Worklog

## [2025-07-09] Rebuild Community + Posts UI (Tranquil Pro Design System)

### Scope
Rebuilt 9 component files for the Community page and Posts system, migrating from mixed Material Symbols + inline styles to the unified **Tranquil Pro** design system with **Lucide React** icons.

### Files Modified

| # | File | Changes |
|---|------|---------|
| 1 | `src/app/community/page.tsx` | Replaced shadcn `Tabs` with custom pill-style tab bar using Framer Motion `layoutId` for animated active indicator. Added greeting header with Sparkles icon. Lucide: `MessageSquarePlus`, `TrendingUp`, `Stethoscope`, `Sparkles` |
| 2 | `src/components/posts/PostCard.tsx` | Full UI rebuild: `card card-interactive` styling, avatar classes, author row with BadgeCheck for doctors, mood badges, action bar (Heart, MessageCircle, Bookmark/BookmarkCheck, Share2), reaction buttons (ThumbsUp, Heart, Frown). Added share handler. Removed all `material-symbols-outlined` spans |
| 3 | `src/components/posts/PostFeed.tsx` | Loading skeleton with `skeleton` class. Empty state with MessageSquarePlus icon. Removed shadcn Skeleton import |
| 4 | `src/components/posts/PostForm.tsx` | Replaced shadcn Textarea/Button with native textarea + `btn btn-primary btn-sm`. Loader2 spinner for loading state. Send icon. Uses `avatar avatar-md` |
| 5 | `src/components/posts/MoodSelector.tsx` | Added AnimatePresence for dropdown, backdrop overlay, labeled moods grid (4-col), selected ring indicator, smile icon via Lucide |
| 6 | `src/components/comments/CommentList.tsx` | Custom skeleton loading, empty state text. Removed shadcn Skeleton import |
| 7 | `src/components/comments/CommentForm.tsx` | Compact inline form: avatar + input + Send/Loader2 button. Enter to submit. `btn btn-primary btn-sm btn-icon-sm` |
| 8 | `src/components/comments/CommentItem.tsx` | Reaction buttons (ThumbsUp, Heart, HelpingHand) with points display. Reply button with Reply icon. Inline reply form toggle. Nested replies with proper styling |
| 9 | `src/components/shared/EmptyState.tsx` | Changed from emoji icon to LucideIcon component prop. Uses primary-light container, heading font |

### Design System Compliance
- **Colors**: `text-primary`, `text-text-primary/secondary/tertiary`, `bg-primary-light`, `bg-primary-50`, `text-warm`, `text-accent`
- **Components**: `card`, `card-interactive`, `card-elevated`, `btn btn-primary btn-sm`, `btn btn-ghost btn-sm btn-icon-sm`, `badge badge-primary`, `avatar avatar-sm/avatar-md`, `skeleton`
- **Typography**: `font-heading`, `text-h3`, `text-body-md`, `text-body-sm`, `text-caption`
- **Animations**: Framer Motion `layoutId` tab indicator, `whileTap`, `AnimatePresence`, `animate-fade-in-up`
- **Icons**: All Lucide React (zero Material Symbols)
- **RTL**: Preserved Arabic content direction

### Logic Preserved
All API calls (`/api/posts`, `/api/posts/:id/reactions`, `/api/bookmarks`, `/api/posts/:id/comments`, `/api/comments/:id/reactions`), state management, event listeners (`post-created`), optimistic UI updates, auth guards, and character limits remain unchanged.

### TypeScript
Zero new type errors. Only pre-existing error in `DoctorCard.tsx` (unrelated).

---

## [2025-07-10] Rebuild Admin + Shared Components (Tranquil Pro Design System)

### Scope
Rebuilt 6 component files for the Admin dashboard, verification system, and shared components. Migrated from shadcn Card/Badge/Button imports and mixed styling to the unified **Tranquil Pro** design system with **Lucide React** icons.

### Files Modified

| # | File | Changes |
|---|------|---------|
| 1 | `src/app/admin/layout.tsx` | Full rebuild: collapsible desktop sidebar (w-64 → w-[72px]) with nav links (Dashboard, Verification Requests), mobile slide-in sidebar overlay with backdrop, glass-dark sticky header with breadcrumb, admin badge indicator, auth guard with EmptyState-style unauthorized screen. Lucide: `Shield`, `FileCheck`, `BarChart3`, `ChevronLeft`, `ChevronRight`, `X`, `Users` |
| 2 | `src/app/admin/page.tsx` | Transformed from simple verification list into full dashboard: 4-card stats grid (Total Users, Doctors, Posts, Pending Verifications) with icons + trend indicators + skeleton loading, recent verification requests list with approve/reject actions, quick actions panel, platform summary sidebar. Preserved all existing API calls + `handleAction` logic. Lucide: `Shield`, `Users`, `Stethoscope`, `FileText`, `CheckCircle`, `XCircle`, `Clock`, `BarChart3`, `Activity`, `Eye`, `TrendingUp`, `ArrowLeft` |
| 3 | `src/app/admin/verification/page.tsx` | Added page header with FileCheck icon, title, and description. Renders VerificationRequests component. Lucide: `FileCheck` |
| 4 | `src/components/admin/VerificationRequests.tsx` | Full rebuild: filter tabs (All/Pending/Reviewed) with counts, expandable review cards (click Eye to expand), role-based avatar colors (doctor=purple, specialist=teal), status badges using `badge-muted`/`badge-success`/`badge-destructive`, review notes textarea with `input` class, approve/reject action buttons, skeleton loading state, EmptyState for empty filters, reviewed requests section with divider. Preserved all existing API logic. Lucide: `CheckCircle`, `XCircle`, `Clock`, `Stethoscope`, `ShieldCheck`, `AlertCircle`, `Eye`, `Ban`, `Filter`, `Search`, `MessageSquare` |
| 5 | `src/components/animations/AnimatedCard.tsx` | Added `whileHover` prop with subtle y:-2 lift + shadow effect, optional `hover` boolean prop to disable hover animation. Preserved existing fadeInUp animation + delay prop |
| 6 | `src/components/shared/EmptyState.tsx` | Changed `icon` prop from `string` (emoji) to `LucideIcon` component prop with `Inbox` default. Icon rendered inside `bg-primary-50` rounded container. Uses `font-heading`, `text-text-primary/secondary` tokens |

### Design System Compliance
- **Colors**: `text-primary`, `text-text-primary/secondary/tertiary`, `bg-primary-light`, `bg-primary-50`, `text-accent`, `bg-accent-light`, `text-success`, `bg-success-light`, `text-destructive`, `bg-destructive-light`, `text-warm`, `bg-[#FEF3C7]`
- **Components**: `card`, `btn btn-primary/btn-ghost/btn-sm/btn-icon-sm/btn-outline`, `badge badge-primary/badge-success/badge-destructive/badge-muted`, `gradient-primary`, `glass-dark`, `skeleton`, `input`, `divider`
- **Typography**: `font-heading`, `text-h2/h3/h4`, `text-body-sm`, `text-caption`, `text-overline`
- **Animations**: Framer Motion `whileHover`, `fadeInUp`, `animate-fade-in-up`, `animate-slide-in-right`
- **Layout**: Responsive sidebar (desktop collapsed/expanded + mobile overlay), `glass-dark` sticky header, 2-col/4-col stats grid, 3-col content grid
- **Icons**: All Lucide React (zero Material Symbols, zero shadcn component imports)
- **RTL**: Preserved Arabic content direction, `dir="rtl"` on layout

### Logic Preserved
All API calls (`/api/admin/verification-requests`, `/api/admin/stats`, `/api/admin/verification-requests/:id`), auth guard (`user.role !== 'admin'` → redirect), state management (`useState` for requests, reviewNotes, filterStatus, expandedId), `handleAction` and `handleReview` functions, PATCH/PUT methods, optimistic UI updates, and toast notifications remain unchanged.

### TypeScript
Zero type errors after rebuild.

---

## [2025-07-10] Rebuild Auth Pages (Clean Tailwind + shadcn/ui)

### Scope
Rewrote 4 auth files (login, register, verify, OTPInput) — stripped all custom CSS classes (`gradient-hero`, `btn`, `input`, `card`, `text-body-md`, `font-heading`, `gradient-primary`, `shadow-glow`, `animate-pulse-soft`, `text-h3`, `text-text-secondary`, `text-text-tertiary`, `bg-primary-50`, `bg-surface-container`, etc.) and replaced with pure Tailwind utility classes + shadcn/ui components. Removed framer-motion dependency from all auth pages.

### Files Modified

| # | File | Changes |
|---|------|---------|
| 1 | `src/app/login/page.tsx` | Removed framer-motion, decorative gradient circles, all custom CSS classes. White `Card` (rounded-2xl shadow-lg border-0) centered on `bg-gradient-to-br from-teal-600 to-teal-700`. shadcn `Button` (bg-teal-600), `Input` (h-12 rounded-lg border-gray-200), `Label`. Preserved all login logic, redirect, error handling, password toggle |
| 2 | `src/app/register/page.tsx` | Same clean treatment. Tab switcher (user/doctor) with `bg-gray-100` container and `bg-teal-600` active state. User form (username/email/phone/password), Doctor form (realName/specialty/email/phone/password). Privacy/verification notes use `bg-teal-50 border-teal-100`. Preserved all registration logic, tab switching, validation, redirects |
| 3 | `src/app/verify/page.tsx` | Lighter background `bg-gradient-to-br from-teal-50 to-gray-100`. KeyRound icon in teal-600 rounded box. OTP input with verify button. Countdown timer + resend. Suspense wrapper for useSearchParams. Preserved all OTP verification logic, countdown, resend |
| 4 | `src/components/auth/OTPInput.tsx` | Replaced `.input` class with pure Tailwind: `w-11 h-13 sm:w-12 sm:h-14 rounded-lg border-2`. States: filled (border-teal-500 bg-teal-50), focused (border-teal-400 ring-2 ring-teal-100), default (border-gray-200). Preserved all logic: auto-focus, auto-advance, backspace nav, paste support, RTL arrow keys, onComplete callback |

### Design Tokens Used (Pure Tailwind)
- **Backgrounds**: `bg-gradient-to-br from-teal-600 to-teal-700` (login/register), `bg-gradient-to-br from-teal-50 to-gray-100` (verify)
- **Card**: `rounded-2xl shadow-lg border-0 p-6 sm:p-8` white
- **Inputs**: `h-12 rounded-lg border-gray-200 pr-11 pl-11`
- **Buttons**: `bg-teal-600 hover:bg-teal-700 text-white h-11 rounded-lg`
- **Text**: `text-3xl font-bold text-white` (headers), `text-white/60` (subheaders), `text-sm font-semibold text-gray-900` (labels), `text-gray-500` (secondary)
- **Errors**: `bg-red-50 border-red-200 text-red-600 rounded-xl`
- **Notes**: `bg-teal-50 border-teal-100 rounded-xl`
- **Links**: `text-teal-600 hover:text-teal-700`

### shadcn/ui Components Used
- `Button` from `@/components/ui/button`
- `Card`, `CardContent` from `@/components/ui/card`
- `Input` from `@/components/ui/input`
- `Label` from `@/components/ui/label`

### Logic Preserved
All API calls, state management, form validation, redirects, error handling, toast notifications, OTP auto-verify, countdown timer, password toggle, tab switching, Suspense boundary — zero logic changes.

### Removed
- `framer-motion` imports from all 3 pages
- All decorative gradient circles/blur elements
- All custom CSS class references (`.gradient-hero`, `.btn`, `.input`, `.font-heading`, `.text-body-md`, etc.)
- Custom SVG logo icon (simplified)

---

## [2025-07-11] Rebuild Landing Page (Pure Tailwind + shadcn/ui)

### Scope
Rewrote the landing page (`src/app/page.tsx`) from scratch, replacing all custom CSS classes (`.btn`, `.card`, `.gradient-hero`, `.badge-*`, `.font-heading`, `.glass`, `.gradient-primary`, etc.) with **pure Tailwind utility classes** and **shadcn/ui components**. Zero custom CSS classes in output.

### File Modified

| # | File | Changes |
|---|------|---------|
| 1 | `src/app/page.tsx` | Full rewrite: ~430 lines. Removed all custom CSS tokens (`gradient-hero`, `gradient-text-accent`, `gradient-text-primary`, `card`, `card-interactive`, `btn`, `btn-primary`, `btn-lg`, `btn-ghost`, `badge`, `badge-primary`, `font-heading`, `glass`, `glass-dark`, `gradient-primary`, `text-h1`, `text-h3`, `text-h4`, `text-body-lg`, `text-body-md`, `text-caption`). Replaced with pure Tailwind (`bg-teal-600`, `text-white`, `rounded-xl`, `shadow-sm`, `font-bold`, etc.) + shadcn components (`Button`, `Card`/`CardHeader`/`CardContent`/`CardFooter`, `Badge`, `Separator`). |

### Design Decisions
- **Navbar**: Fixed top, white bg, `shadow-sm`. Logo "وصال" on right, `Button` ghost + solid teal-600 on left
- **Hero**: Solid `bg-teal-600`, white text, `font-extrabold` heading, `Badge` pill, two CTAs (white solid + outline)
- **Stats**: 4-column grid of `Card` components on `bg-gray-50`, `hover:shadow-md` transition
- **Features**: 2-column `Card` grid with teal-600 icon containers
- **How it works**: 3-column `Card` grid with step number badges, `bg-gray-50` background
- **Testimonials**: `bg-teal-700` dark section, `Card` with `bg-white/10` and star ratings
- **CTA**: `Card` with `bg-gradient-to-br from-teal-600 to-teal-800` gradient
- **Footer**: White bg, `border-t`, `Separator` divider, links
- **Animations**: Framer Motion `fadeUp` (opacity 0→1, y 24→0) on section entry only. No complex animations.
- **Icons**: All lucide-react (`Heart`, `Shield`, `Lock`, `EyeOff`, `MessageCircle`, `Users`, `Stethoscope`, `Star`, `CheckCircle`, `ArrowLeft`, `UserPlus`, `Headphones`, `Sparkles`, `Fingerprint`)
- **RTL**: `dir="rtl"` set in root layout, all text in Arabic
- **Auth**: `useAuth` hook → redirect to `/community` if logged in, loading spinner on teal-600 bg

### TypeScript
Zero new type errors.

---

## [2025-07-11] Rebuild Community + Posts (Pure Tailwind + shadcn/ui)

### Scope
Rewrote all 9 community/post/comment files, replacing all custom CSS classes (`card`, `card-interactive`, `card-elevated`, `btn`, `btn-primary`, `btn-ghost`, `btn-icon-sm`, `btn-sm`, `badge`, `badge-primary`, `avatar`, `avatar-md`, `avatar-sm`, `skeleton`, `font-heading`, `text-h3`, `text-h4`, `text-body-md`, `text-body-sm`, `text-caption`, `text-text-primary`, `text-text-secondary`, `text-text-tertiary`, `gradient-primary`, `bg-primary-light`, `bg-primary-50`, `bg-surface-container`, `bg-surface-dim`, `border-border-light`, `text-warm`, `bg-warm-light`, `text-accent`, `bg-accent-light`) with **pure Tailwind utility classes** and **shadcn/ui components**. Removed framer-motion from all community files.

### Files Modified

| # | File | Changes |
|---|------|---------|
| 1 | `src/app/community/page.tsx` | Removed framer-motion. Replaced custom pill tab bar with shadcn `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`. Header with teal-600 icon box. Auth guard + loading spinner preserved |
| 2 | `src/components/posts/PostCard.tsx` | `Card`/`CardContent`, `Avatar`/`AvatarFallback`, `Badge`, `Button` (ghost, icon-sm) for all actions. Mood tags as teal-50 spans. Removed framer-motion |
| 3 | `src/components/posts/PostFeed.tsx` | `Skeleton` for loading (3 cards). `EmptyState` for empty feed. Preserved `post-created` event listener |
| 4 | `src/components/posts/PostForm.tsx` | `Card`/`CardContent`, `Avatar`, `Textarea`, `Button` (sm). Char counter. Preserved all post logic + Ctrl+Enter |
| 5 | `src/components/posts/MoodSelector.tsx` | shadcn `Popover` for emoji grid. `Button` ghost toggle. Removed framer-motion AnimatePresence |
| 6 | `src/components/comments/CommentList.tsx` | `Skeleton` loading. Empty state. Preserved fetch + cancel logic |
| 7 | `src/components/comments/CommentForm.tsx` | `Avatar` (sm), native input, `Button` (icon-sm) Send. Preserved Enter-to-submit, parentId |
| 8 | `src/components/comments/CommentItem.tsx` | `Avatar` (sm), `Button` (ghost, xs) reactions + reply. Nested replies. Removed framer-motion |
| 9 | `src/components/shared/EmptyState.tsx` | `Button` for optional action. `actionLabel`/`onAction` props. Teal-50 icon container |

### shadcn/ui Components Used
- `Card`, `CardContent` · `Avatar`, `AvatarFallback` · `Button` (default/ghost, sm/icon-sm/xs) · `Badge` · `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` · `Textarea` · `Popover`, `PopoverTrigger`, `PopoverContent` · `Skeleton`

### Design Tokens (Pure Tailwind)
- **Primary**: teal-600/50/100/700 · **Text**: gray-900/600/400 · **Accents**: amber-500/50 (bookmark), purple-500/50 (share/reply) · **Borders**: gray-100/200 · **Backgrounds**: gray-50, white

### Logic Preserved
All API calls, state management, event listeners (`post-created`), optimistic UI updates, auth guards, character limits, keyboard shortcuts, navigator.share, clipboard fallback, toast notifications — zero logic changes.

### Removed
- `framer-motion` from all 9 files
- All custom CSS class references
- Custom tab bar with motion layoutId
- Custom mood dropdown with AnimatePresence

### TypeScript
Zero new type errors. Build compiles cleanly.

### Build Verification
- `npx tsc --noEmit` ✓ zero errors in modified files

---

## [2025-07-11] Rebuild Layout + Navbar + BottomNav + Admin + Shared (Pure Tailwind + shadcn/ui)

### Scope
Rewrote 8 files across layout, admin, and shared components. Stripped ALL custom CSS classes (`.glass-subtle`, `.glass-dark`, `.gradient-primary`, `.btn`, `.btn-ghost`, `.btn-primary`, `.btn-sm`, `.btn-icon-sm`, `.card`, `.badge`, `.badge-*`, `.skeleton`, `.divider`, `.font-heading`, `.text-h*`, `.text-body-*`, `.text-caption`, `.text-text-primary/secondary/tertiary`, `.bg-primary-light`, `.bg-accent-light`, `.bg-success-light`, `.bg-destructive-light`, `.text-primary`, `.text-accent`, `.text-success`, `.text-destructive`, `.text-warm`, `.animate-fade-in-*`, `.animate-slide-in-*`, `.mobile-bottom-nav`, `.bg-card`, `.bg-background`, `.bg-muted`, `.border-border-light`, `.text-overline`) and replaced with **pure Tailwind utility classes** + **shadcn/ui components** (`Button`, `Card`/`CardHeader`/`CardTitle`/`CardContent`, `Avatar`/`AvatarFallback`, `Badge`, `Separator`, `Skeleton`, `Textarea`).

### Files Modified

| # | File | Changes |
|---|------|---------|
| 1 | `src/components/layout/Navbar.tsx` | Sticky `bg-white border-b border-border shadow-sm` header. Logo "وصال" (→ `/community` if logged in). Desktop: `Button` ghost/icon for Bell + Avatar + LogOut. Mobile: hamburger menu dropdown with `Button` ghost/icon. Unlogged: ghost "دخول" + teal-600 "حساب جديد" `Button`s. Preserved all auth logic, mobile menu state |
| 2 | `src/components/layout/MobileBottomNav.tsx` | Fixed bottom `bg-white border-t shadow-[0_-4px_20px_...]`, `md:hidden`. 5 tabs: الرئيسية/المجتمع/الأطباء/التنبيهات/الملف. Active = `text-teal-600` + `bg-teal-50` dot indicator. Hidden when not logged in. Preserved all routing + active detection logic |
| 3 | `src/components/layout/MainLayout.tsx` | Simple `min-h-screen bg-gray-50 flex flex-col`. `Navbar` + `main max-w-3xl mx-auto px-4 flex-1` + `MobileBottomNav` |
| 4 | `src/app/admin/layout.tsx` | Desktop sidebar (`w-64`/`w-[72px]` collapsed) with `bg-white border-l`. Nav links with `bg-teal-50 text-teal-600` active state. Mobile slide-in overlay with backdrop. Top header `bg-gray-900`. Admin `Badge` (bg-teal-600). Auth guard preserved (role check → unauthorized screen with `Button`) |
| 5 | `src/app/admin/page.tsx` | Dashboard: 4 stat `Card`s (teal/purple/green/amber icons), `Skeleton` loading, trend arrows. Verification requests list with `Card` + `Badge` + `Button` (approve/reject). Quick actions `Card`. Platform summary with `Separator`. Preserved ALL API logic (`/api/admin/stats`, `/api/admin/verification-requests`, handleAction) |
| 6 | `src/app/admin/verification/page.tsx` | Simple page header with `FileCheck` icon + title + description. Renders `VerificationRequests` component |
| 7 | `src/components/admin/VerificationRequests.tsx` | Filter tabs: `Button` default (teal-600 active) / ghost. Pending cards: `Card` + `Badge` (secondary/outline/destructive) for status. Expandable review with `Textarea` + `Button` (approve teal-600 / reject ghost red). Reviewed section with `Separator` dividers. `Skeleton` loading. `EmptyState` for empty. Preserved ALL API logic (fetch, PATCH, handleReview, filter state) |
| 8 | `src/components/animations/AnimatedCard.tsx` | Unchanged: framer-motion fadeInUp with `whileHover` y:-2 lift + shadow. Delay + className + hover props |

### shadcn/ui Components Used
- `Button` (default/ghost/destructive/secondary, sm/icon) · `Card`/`CardHeader`/`CardTitle`/`CardContent` · `Avatar`/`AvatarFallback` · `Badge` (default/secondary/destructive/outline) · `Separator` · `Skeleton` · `Textarea`

### Design Tokens (Pure Tailwind)
- **Primary**: `bg-teal-600`, `hover:bg-teal-700`, `text-teal-600`, `bg-teal-50`
- **Accent**: `bg-purple-50`, `text-purple-600`
- **Success**: `bg-green-50`, `text-green-600`
- **Destructive**: `text-red-600`, `hover:bg-red-50`
- **Warm**: `bg-amber-50`, `text-amber-600`
- **Neutral**: `bg-gray-50`, `bg-gray-900`, `text-foreground`, `text-muted-foreground`
- **Borders**: `border-border`
- **Admin header**: `bg-gray-900` with white text

### Logic Preserved
All API calls (`/api/admin/verification-requests`, `/api/admin/stats`, `/api/admin/verification-requests/:id`), auth guard (`user.role !== 'admin'`), state management (requests, reviewNotes, filterStatus, expandedId), handleAction/handleReview, PATCH/PUT methods, optimistic UI, toast notifications, sidebar collapse, mobile menu — zero logic changes.

### Custom CSS Class Audit
Zero custom CSS class references across all 8 rewritten files (verified via grep).

---

## [2025-07-12] Rebuild Doctors + Booking + Profile + Chat + Notifications + Bookmarks (Pure Tailwind + shadcn/ui)

### Scope
Rewrote 7 files across doctors listing, booking flow, user profile, chat, notifications, and bookmarks. Stripped ALL custom CSS classes (`.btn`, `.btn-primary`, `.btn-ghost`, `.btn-icon-sm`, `.btn-sm`, `.btn-lg`, `.card`, `.card-interactive`, `.input`, `.badge`, `.badge-primary`, `.badge-accent`, `.badge-muted`, `.avatar`, `.avatar-lg`, `.avatar-2xl`, `.avatar-md`, `.skeleton`, `.gradient-primary`, `.font-heading`, `.text-h2`, `.text-h3`, `.text-h4`, `.text-body-sm`, `.text-body-md`, `.text-caption`, `.text-foreground`, `.text-muted-foreground`, `.text-text-secondary`, `.text-text-tertiary`, `.bg-primary-light`, `.bg-primary-50`, `.bg-card`, `.bg-background`, `.bg-muted`, `.bg-success-light`, `.bg-destructive-light`, `.border-border-light`, `.text-primary`, `.text-success`, `.text-accent`, `.text-warm`, `.bg-accent-light`, `.bg-warm-light`, `.text-destructive`, `.chat-messages`) and replaced with **pure Tailwind utility classes** + **shadcn/ui components**. Removed framer-motion from all 7 files.

### Files Modified

| # | File | Changes |
|---|------|---------|
| 1 | `src/app/doctors/page.tsx` | Page header with teal-50 icon box + title. shadcn `Input` (pr-10) for search with Search icon overlay. Doctor grid (1-col → 2-col md). Skeleton loading (4 cards with `animate-pulse`). Empty state. Preserved all fetch + filter logic |
| 2 | `src/components/doctors/DoctorCard.tsx` | shadcn `Card` (rounded-xl shadow-sm), `Avatar`/`AvatarImage`/`AvatarFallback` (size-14), `Badge` (teal-600), `Button` (teal-600 → book link). Star rating with amber-400 fill. Location, bio, verified badge. Removed AnimatedCard |
| 3 | `src/app/book/[doctorId]/page.tsx` | Doctor info card with Avatar + Badge + star rating. Booking form: shadcn `Input` (date/time), `Textarea` (reason, min-h-[120px]), `Button` (submit with Loader2 spinner). Success state with emerald-50 CheckCircle. Preserved ALL API logic (fetch doctor, POST appointment, redirect to chat) |
| 4 | `src/app/profile/[username]/page.tsx` | Profile header: `bg-teal-600` gradient with `rounded-b-[2rem]`, large Avatar (size-20), name/bio/handle. Stats card (3-col grid with divide-x). Reputation tier card with teal-600 progress bar. Interests with `Badge` secondary. Recent posts with `Card` + engagement row. Preserved ALL fetch + tier calculation logic |
| 5 | `src/app/chat/[roomId]/page.tsx` | Chat header: `bg-teal-600` with back button + Avatar. Messages: `bg-gray-100` incoming / `bg-teal-600 text-white` outgoing (rounded-2xl with corner adjustments). Voice messages with waveform bars. Recording indicator: `bg-red-50` with pulse dot. Input bar: native input (rounded-full bg-gray-100) + mic/send `Button`s. Preserved ALL websocket/polling logic (5s interval, optimistic send, MediaRecorder voice) |
| 6 | `src/app/notifications/page.tsx` | Page header with teal-50 Bell icon + unread badge. shadcn `Button` ghost (mark all read). Type-based icon map (Heart/MessageCircle/BadgeCheck/Megaphone/Calendar/CheckCircle) with colored backgrounds. Read/unread visual states (bg-teal-50 vs bg-white/opacity-70). Unread dot indicator. Preserved ALL API logic (fetch, PATCH mark all, optimistic read) |
| 7 | `src/app/bookmarks/page.tsx` | Page header with teal-50 BookmarkCheck icon + count. Author row with Avatar + doctor Badge (amber). Post content with mood tags. Engagement row with Separator. Remove button (group-hover opacity toggle). Preserved ALL API logic (fetch bookmarks, POST toggle remove, optimistic remove with rollback) |

### shadcn/ui Components Used
- `Button` (default/ghost/destructive, sm/icon-sm/icon-xs) · `Card`/`CardContent` · `Avatar`/`AvatarFallback`/`AvatarImage` · `Badge` (default/secondary) · `Input` · `Textarea` · `Separator`

### Design Tokens (Pure Tailwind)
- **Primary**: `bg-teal-600`, `hover:bg-teal-700`, `text-teal-600`, `bg-teal-50`, `border-teal-100`, `ring-teal-100`
- **Chat outgoing**: `bg-teal-600 text-white rounded-2xl rounded-tl-sm`
- **Chat incoming**: `bg-gray-100 text-gray-900 rounded-2xl rounded-tr-sm`
- **Recording**: `bg-red-50`, `text-red-600`, `border-red-100`
- **Stars**: `fill-amber-400 text-amber-400`, `text-gray-300` (empty)
- **Verified**: `text-emerald-500`
- **Success**: `bg-emerald-50`, `text-emerald-500`
- **Doctor badge**: `bg-amber-100 text-amber-700`
- **Text**: gray-900 (primary), gray-500 (secondary), gray-400 (tertiary)
- **Cards**: `bg-white rounded-xl shadow-sm border-gray-100`
- **Skeletons**: `animate-pulse bg-gray-200 rounded`
- **Background**: `bg-gray-50`

### Logic Preserved
All API calls preserved:
- `/api/doctors` (list + filter by doctorId)
- `/api/appointments` (POST booking with date/time/reason)
- `/api/profiles/{username}` + `/api/posts?author={username}&limit=3`
- `/api/chat/{roomId}/messages` (GET initial + 5s polling, POST text send)
- `/api/chat/{roomId}/voice` (POST voice with MediaRecorder + FileReader base64)
- `/api/notifications` (GET list, PATCH mark all read)
- `/api/bookmarks` (GET list, POST toggle remove)
- Auth guards, optimistic UI updates with rollback, toast notifications, character counters, time-ago formatters, tier calculation, cancel-on-unmount pattern — zero logic changes.

### Removed
- `framer-motion` imports from all 7 files
- `AnimatedCard` wrapper from DoctorCard
- `AnimatePresence` from booking page
- All custom CSS class references

### TypeScript
Zero new type errors in modified files. Build compiles cleanly (`npx tsc --noEmit` verified).
