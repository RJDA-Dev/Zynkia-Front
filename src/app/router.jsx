import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from './AuthGuard'
import AuthLayout from '../layouts/AuthLayout'
import SidebarLayout from '../layouts/SidebarLayout'
import EmployeeLayout from '../layouts/EmployeeLayout'

const LoginPage = lazy(() => import('../modules/auth/LoginPage'))
const AuthCallbackPage = lazy(() => import('../modules/auth/AuthCallbackPage'))
const DashboardPage = lazy(() => import('../modules/dashboard/DashboardPage'))
const EmployeeListPage = lazy(() => import('../modules/employees/EmployeeListPage'))
const EmployeeDetailPage = lazy(() => import('../modules/employees/EmployeeDetailPage'))
const OvertimeRulesPage = lazy(() => import('../modules/payroll/OvertimeRulesPage'))
const PayrollLiquidationPage = lazy(() => import('../modules/payroll-liquidation/PayrollLiquidationPage'))
const RequestApprovalPage = lazy(() => import('../modules/requests/RequestApprovalPage'))
const UserManagementPage = lazy(() => import('../modules/users/UserManagementPage'))
const SchedulePage = lazy(() => import('../modules/schedule/SchedulePage'))
const ReportsPage = lazy(() => import('../modules/reports/ReportsPage'))
const AttendancePage = lazy(() => import('../modules/attendance/AttendancePage'))
const DepartmentsPage = lazy(() => import('../modules/departments/DepartmentsPage'))
const GeneralPage = lazy(() => import('../modules/settings/GeneralPage'))
const UserProfilePage = lazy(() => import('../modules/profile/UserProfilePage'))
const EmployeeHomePage = lazy(() => import('../modules/employee/EmployeeHomePage'))
const EmployeeSchedulePage = lazy(() => import('../modules/employee/EmployeeSchedulePage'))
const NewRequestPage = lazy(() => import('../modules/employee/NewRequestPage'))
const EmployeeNotificationsPage = lazy(() => import('../modules/employee/EmployeeNotificationsPage'))

function Loader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function L({ children }) {
  return <Suspense fallback={<Loader />}>{children}</Suspense>
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<L><LoginPage /></L>} />
        <Route path="/auth/callback" element={<L><AuthCallbackPage /></L>} />
      </Route>
      <Route element={<AuthGuard><SidebarLayout /></AuthGuard>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<L><DashboardPage /></L>} />
        <Route path="/employees" element={<L><EmployeeListPage /></L>} />
        <Route path="/employees/:id" element={<L><EmployeeDetailPage /></L>} />
        <Route path="/attendance" element={<L><AttendancePage /></L>} />
        <Route path="/payroll/overtime" element={<L><OvertimeRulesPage /></L>} />
        <Route path="/payroll/liquidation" element={<L><PayrollLiquidationPage /></L>} />
        <Route path="/requests" element={<L><RequestApprovalPage /></L>} />
        <Route path="/schedule" element={<L><SchedulePage /></L>} />
        <Route path="/reports" element={<L><ReportsPage /></L>} />
        <Route path="/users" element={<L><UserManagementPage /></L>} />
        <Route path="/departments" element={<L><DepartmentsPage /></L>} />
        <Route path="/settings/general" element={<L><GeneralPage /></L>} />
        <Route path="/profile" element={<L><UserProfilePage /></L>} />
      </Route>
      <Route element={<AuthGuard><EmployeeLayout /></AuthGuard>}>
        <Route path="/employee" element={<L><EmployeeHomePage /></L>} />
        <Route path="/employee/schedule" element={<L><EmployeeSchedulePage /></L>} />
        <Route path="/employee/requests" element={<L><NewRequestPage /></L>} />
        <Route path="/employee/notifications" element={<L><EmployeeNotificationsPage /></L>} />
        <Route path="/employee/profile" element={<L><UserProfilePage /></L>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
