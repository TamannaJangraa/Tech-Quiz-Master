# Student Registration Feature Implementation Plan

## Repository Research

### Current Architecture
- **Tech Stack**: Node.js/Express backend, React/Vite frontend, MongoDB/Mongoose, Clerk Auth
- **User Model** ([user.js](file:///c:/Users/MY%20PC/OneDrive/Desktop/Tech%20Quiz/backend/model/user.js)): clerkID, email, fullName, role, isLoggedIn, lastActiveDate, eligibilityStatus
- **Auth Flow**: Clerk handles signup/login via frontend `SignInButton` modal → Clerk webhook (`POST /api/users/webhook`) creates User doc in MongoDB
- **Current Webhook Logic** ([userController.js#L109-L147](file:///c:/Users/MY%20PC/OneDrive/Desktop/Tech%20Quiz/backend/controllers/userController.js#L109-L147)): Auto-approves @pietgroup.co.in emails, rejects others (this needs removal per requirement #5)
- **UI Style**: Tailwind CSS, primary color indigo-600, white rounded-2xl cards with shadow, consistent inputs and buttons

### Gap Analysis
- ❌ No `mobileNumber` field in User schema
- ❌ No registration form page in frontend
- ❌ No backend endpoint to save student registration details (name, email, mobile)
- ❌ No Register button in Navbar/Home
- ❌ No redirect flow after Clerk signup to complete registration

---

## Files and Modules to Change

### Backend (4 files)
| File | Change |
|------|--------|
| [backend/model/user.js](file:///c:/Users/MY%20PC/OneDrive/Desktop/Tech%20Quiz/backend/model/user.js) | Add `mobileNumber` field to userSchema |
| [backend/controllers/userController.js](file:///c:/Users/MY%20PC/OneDrive/Desktop/Tech%20Quiz/backend/controllers/userController.js) | Add `registerStudent` controller; **remove** auto-eligibility logic from `clerkWebhook` (per req #5) |
| [backend/routes/User.js](file:///c:/Users/MY%20PC/OneDrive/Desktop/Tech%20Quiz/backend/routes/User.js) | Add `POST /register` route with Clerk auth protection |

### Frontend (5 files, 1 new)
| File | Change |
|------|--------|
| **frontend/src/pages/Register.jsx** (NEW) | Registration form page: Full Name, Email (prefilled), Mobile Number fields |
| [frontend/src/App.jsx](file:///c:/Users/MY%20PC/OneDrive/Desktop/Tech%20Quiz/frontend/src/App.jsx) | Add `<Route path="/register" element={<Register />} />` |
| [frontend/src/components/Navbar.jsx](file:///c:/Users/MY%20PC/OneDrive/Desktop/Tech%20Quiz/frontend/src/components/Navbar.jsx) | Add "Register" button alongside Login when user is signed out |
| [frontend/src/pages/Home.jsx](file:///c:/Users/MY%20PC/OneDrive/Desktop/Tech%20Quiz/frontend/src/pages/Home.jsx) | Add "Register" button option alongside Login |
| [frontend/src/services/api.js](file:///c:/Users/MY%20PC/OneDrive/Desktop/Tech%20Quiz/frontend/src/services/api.js) | Add `registerStudent()` helper function |

---

## Implementation Steps (Dependency Order)

### Phase 1: Backend Schema & API
1. **Update User Model** — Add `mobileNumber: { type: String }` field to `userSchema` in `backend/model/user.js`
2. **Create registerStudent Controller** — In `userController.js`, add a protected endpoint function that:
   - Gets clerkID from Clerk auth (`getAuth(req)`)
   - Accepts `{ fullName, email, mobileNumber }` in request body
   - Validates required fields (mobile must be provided)
   - Uses `findOneAndUpdate({ clerkID }, ..., { upsert: true })` to save
   - Returns standard `{ success, message, result }` format
3. **Modify clerkWebhook** — Remove lines 120-127 (auto eligibility check) and line 136 (`eligibilityStatus: status`). Keep only basic user creation with `eligibilityStatus: "pending"` always. (Per requirement #5: no eligibility conditions yet)
4. **Register Route** — Add `router.post("/register", registerStudent)` to `routes/User.js`. Import the controller.

### Phase 2: Frontend Registration Page
5. **Create Register.jsx** — New page at `frontend/src/pages/Register.jsx`:
   - Include `<Navbar />` wrapper (convention from other pages)
   - Auth guard: if not signed in, show Clerk `SignInButton` (matching Quiz.jsx pattern)
   - Use `useUser()` hook to get `fullName` and `email` from Clerk and pre-fill those fields as read-only/disabled
   - Form fields: Full Name (readonly), Email (readonly), Mobile Number (required input)
   - Submit handler: call API, then navigate to "/" or show success message
   - Match exact UI style from Quiz.jsx "NAME SCREEN" card: rounded-2xl shadow-md p-8, indigo buttons
6. **Add api.js Helper** — Add `registerStudent(data, token)` function that calls `POST /users/register`

### Phase 3: Frontend Routing & Navigation
7. **Update App.jsx** — Import `Register` component and add route: `<Route path="/register" element={<Register />} />`
8. **Update Navbar.jsx** — Add "Register" button next to existing Login button (only visible when `!isSignedIn`). Use `SignUpButton mode="modal"` from Clerk, then after sign-up redirect to `/register` OR simply make Register button navigate to `/register` page which handles auth itself. **Simplest approach**: Make Register button navigate to `/register`.
9. **Update Home.jsx** — Optionally add Register button below or next to Login button for better UX. Can use same approach as Navbar.

### Phase 4: Post-Registration Flow (Simple)
- The Register page itself handles the flow: user goes to /register → if not logged in, Clerk SignIn/SignUp modal → after auth, form appears with prefilled name/email → user enters mobile → saves.
- No complex redirect hooks needed; `/register` page is self-contained.

---

## Dependencies and Considerations
- **Clerk Retained**: All auth still goes through Clerk. We only ADD a data-collection step AFTER Clerk auth.
- **No Breaking Changes**: Existing `clerkWebhook` still creates users; we just remove the email-domain eligibility check.
- **Eligibility Status**: Always `"pending"` now (per req #5). Admin will handle approval later.
- **Active/Inactive**: NOT added to registration form (per req #6). User model doesn't have `isActive` field yet; this is fine because Admin Dashboard will handle it later.
- **Upsert Safe**: `registerStudent` uses upsert so it works whether webhook created the doc first or not.
- **No New Packages**: Uses existing libraries (Clerk, Express, Mongoose, React Router).

---

## Validation (After Implementation)
1. **Compile Check**:
   - Backend: Run `cd backend && node server.js` (or check for import/syntax errors)
   - Frontend: Run `cd frontend && npm run build` → fix any Vite/lint errors
2. **Functional Tests**:
   - Navigate to `/register` → see Register page with Navbar
   - Click Register button in Navbar → navigates to `/register`
   - If not logged in → SignIn/SignUp modal appears
   - After sign-in → form shows with Name and Email prefilled from Clerk
   - Enter mobile number → submit → success message → User doc in MongoDB now has mobileNumber
   - Existing flows: Start Quiz, Leaderboard, My Results, Admin Panel all still work
3. **Database Check**: Verify new User document has `mobileNumber` field saved
4. **Admin Dashboard**: Verify stats still load (getStats controller not modified)

---

## Risks and Handling
| Risk | Mitigation |
|------|------------|
| Webhook order: user.created fires AFTER register page loads → user doc might not exist yet | `registerStudent` uses `upsert: true`, so it creates or updates regardless |
| Clerk user data (name/email) might be empty | Fallback: allow user to edit name/email fields if Clerk values are blank; or show placeholder |
| Removing eligibility check breaks admin expectations | Requirement #5 explicitly says no eligibility yet; admin can manually approve via dashboard later |
| Mobile number format validation | Basic check: not empty, min 10 digits. No strict regex (student project, simple). |
| Forgetting `isRegistered` check → user submits registration twice | Idempotent: second submit just overwrites with same data. No harm. |
