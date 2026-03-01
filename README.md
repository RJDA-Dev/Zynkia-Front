# Zynkia Frontend

React 18 + Vite + Tailwind CSS 4. Multi-tenant HR/payroll SaaS platform.

Connects to the [Zynkia Backend](https://github.com/RJDA-Dev/Zynkia-Backend) API.


## Stack

- React 18 + React Router 6
- Vite 6 + Tailwind CSS 4 (via @tailwindcss/vite)
- Axios (API client)
- Recharts (charts)
- Socket.IO Client (presence/realtime)
- Firebase SDK (push notifications)
- jsPDF + jspdf-autotable (client-side report exports)
- Dinero.js (currency formatting)
- Google Material Symbols (icons via CDN)


## Quick Start

```bash
# 1. Backend must be running (see Zynkia-Backend repo)
# 2. Setup
cp .env.example .env    # fill Firebase config (optional, for push notifications)
npm install
npm run dev             # http://localhost:5173
```

Default login: `admin@zynkia.co` / `admin123` (via Keycloak)


## Project Structure

```
src/
  main.jsx                          Entry point
  styles/index.css                  Tailwind imports + custom CSS

  api/
    client.js                       Axios instance, interceptors, Keycloak PKCE auth
    services.js                     All API endpoint functions grouped by module

  app/
    App.jsx                         Root component, providers, router
    AuthGuard.jsx                   Route protection by auth state
    router.jsx                      All route definitions

  components/
    Sidebar.jsx                     Main navigation sidebar
    UserMenu.jsx                    User dropdown (profile, logout)
    NotificationPanel.jsx           Notification bell + panel
    AddEmployeeModal.jsx            Employee creation modal
    ui/                             Reusable UI components
      Avatar, Badge, Button, Card, DatePicker, FileUpload,
      Input, Modal, Pagination, ProgressBar, Select,
      StatCard, Table, Tabs, Toggle

  context/
    AuthContext.jsx                  Keycloak auth state + token management
    LangContext.jsx                  i18n (es/en) with translation keys
    ToastContext.jsx                 Toast notifications
    LoaderContext.jsx                Global loading state
    RoleContext.jsx                  User role for conditional UI
    TimeFormatContext.jsx            12h/24h time format preference

  hooks/
    useFetch.js                     Data fetching with caching + loading state
    useCurrency.js                  Currency formatting (COP)
    usePresence.js                  Socket.IO presence hook

  layouts/
    SidebarLayout.jsx               Main app layout (sidebar + header + content)
    AuthLayout.jsx                  Login/register layout
    EmployeeLayout.jsx              Employee self-service layout

  modules/
    auth/
      LoginPage.jsx                 Keycloak PKCE login redirect
      AuthCallbackPage.jsx          OIDC callback handler
    dashboard/
      DashboardPage.jsx             Stats, charts, online users, recent activity
    employees/
      EmployeeListPage.jsx          Grouped by department, server-side pagination
      EmployeeDetailPage.jsx        Employee profile, documents, history
    departments/
      DepartmentsPage.jsx           Department CRUD
    attendance/
      AttendancePage.jsx            Daily records + weekly calendar view + CSV export
    schedule/
      SchedulePage.jsx              Year/month/week views, shift edit/delete, leave overlay
      CreateShiftModal.jsx          Manual shift creation
      ShiftGeneratorModal.jsx       AI shift generation
    payroll-liquidation/
      PayrollLiquidationPage.jsx    Salary + overtime settlement, PDF view/download
    payroll/
      OvertimeRulesPage.jsx         OT rules toggle + employee balance tracking
    requests/
      RequestApprovalPage.jsx       Request list, approve/reject
    users/
      UserManagementPage.jsx        User CRUD, role management with module toggles
    reports/
      ReportsPage.jsx               Payroll/attendance/request reports + PDF/CSV export
    settings/
      GeneralPage.jsx               Company settings
      LocalizationPage.jsx          Language, timezone, currency
      SecurityPage.jsx              2FA, session timeout
    profile/
      UserProfilePage.jsx           Profile + localization + security tabs
    employee/
      EmployeeHomePage.jsx          Self-service dashboard
      EmployeeSchedulePage.jsx      Personal schedule view
      NewRequestPage.jsx            Submit leave/absence request
    onboarding/
      OnboardingPage.jsx            Onboarding process tracking

  lib/
    firebase.js                     Firebase SDK initialization

  utils/
    payrollPdf.js                   Payslip PDF helpers
    reportPdf.js                    Report PDF/CSV export functions

  data/
    mock.js                         Legacy mock data (unused, kept for reference)

public/
  firebase-messaging-sw.js         Service worker for FCM push
```


## API Connection

The axios client (`src/api/client.js`) handles:

1. Keycloak PKCE authentication flow
2. Token storage and auto-refresh
3. Response unwrapping: backend wraps all responses as `{ statusCode, success, data, timestamp }`, the interceptor extracts `res.data.data` so components receive the inner data directly
4. Base URL defaults to `http://localhost:3000/api`

All API functions are in `src/api/services.js`, grouped by module:
- `employees.list()`, `employees.deptCounts()`, etc.
- `attendance.byDate(date)`, `attendance.checkIn(data)`
- `payroll.run(dto)`, `payroll.overtimeBalances()`
- `schedule.month(year, month)`, `schedule.createShift(data)`
- And so on for all modules


## Design System

- Primary color: `#7e22ce` (purple-700)
- Overtime/warnings: amber palette
- Icons: Google Material Symbols (outlined, loaded via CDN in index.html)
- No emojis anywhere in the UI
- Language: Spanish by default, English toggle in settings
- Currency: COP (Colombian Peso), formatted with Dinero.js


## Environment Variables

| Variable | Description | Required |
|---|---|---|
| VITE_FIREBASE_API_KEY | Firebase Web API key | No (push won't work) |
| VITE_FIREBASE_AUTH_DOMAIN | Firebase auth domain | No |
| VITE_FIREBASE_PROJECT_ID | Firebase project ID | No |
| VITE_FIREBASE_SENDER_ID | FCM sender ID | No |
| VITE_FIREBASE_APP_ID | Firebase app ID | No |
| VITE_FIREBASE_VAPID_KEY | FCM VAPID key | No |

Firebase config is optional. Without it, push notifications are disabled but everything else works.


## Build

```bash
npm run build           # Output in dist/
npm run preview         # Preview production build
```

The `dist/` folder can be served by any static file server (nginx, Caddy, S3+CloudFront, etc). Make sure to configure SPA fallback (all routes -> index.html).
