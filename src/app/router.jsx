import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from './AuthGuard'
import AuthLayout from '../layouts/AuthLayout'
import SidebarLayout from '../layouts/SidebarLayout'
import EmployeeLayout from '../layouts/EmployeeLayout'

const LoginPage = lazy(() => import('../modules/auth/LoginPage'))
const AuthCallbackPage = lazy(() => import('../modules/auth/AuthCallbackPage'))
const DashboardPage = lazy(() => import('../modules/dashboard/DashboardPage'))
const HiringStagePage = lazy(() => import('../modules/lifecycle/HiringStagePage'))
const AdministrationStagePage = lazy(() => import('../modules/lifecycle/AdministrationStagePage'))
const OffboardingStagePage = lazy(() => import('../modules/lifecycle/OffboardingStagePage'))
const EmployeeListPage = lazy(() => import('../modules/employees/EmployeeListPage'))
const EmployeeDetailPage = lazy(() => import('../modules/employees/EmployeeDetailPage'))
const InventoryPage = lazy(() => import('../modules/inventory/InventoryPage'))
const VacanciesPage = lazy(() => import('../modules/vacancies/VacanciesPage'))
const CandidateApplyPage = lazy(() => import('../modules/vacancies/CandidateApplyPage'))
const ContractsPage = lazy(() => import('../modules/contracts/ContractsPage'))
const EmployeeFilesPage = lazy(() => import('../modules/people-ops/EmployeeFilesPage'))
const WorkflowAutomationPage = lazy(() => import('../modules/people-ops/WorkflowAutomationPage'))
const OnboardingOpsPage = lazy(() => import('../modules/people-ops/OnboardingOpsPage'))
const BenefitsExpensesPage = lazy(() => import('../modules/people-ops/BenefitsExpensesPage'))
const CompliancePage = lazy(() => import('../modules/people-ops/CompliancePage'))
const PerformancePage = lazy(() => import('../modules/people-ops/PerformancePage'))
const AccessProvisioningPage = lazy(() => import('../modules/people-ops/AccessProvisioningPage'))
const HelpdeskPage = lazy(() => import('../modules/people-ops/HelpdeskPage'))
const OrgPlanningPage = lazy(() => import('../modules/people-ops/OrgPlanningPage'))
const IntegrationsPage = lazy(() => import('../modules/people-ops/IntegrationsPage'))
const OvertimeRulesPage = lazy(() => import('../modules/payroll/OvertimeRulesPage'))
const OvertimeCalculatorPage = lazy(() => import('../modules/payroll/OvertimeCalculatorPage'))
const PayrollLiquidationPage = lazy(() => import('../modules/payroll-liquidation/PayrollLiquidationPage'))
const RequestApprovalPage = lazy(() => import('../modules/requests/RequestApprovalPage'))
const SanctionsPage = lazy(() => import('../modules/sanctions/SanctionsPage'))
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
const EmployeePaymentsPage = lazy(() => import('../modules/employee/EmployeePaymentsPage'))
const EmployeeInventoryPage = lazy(() => import('../modules/employee/EmployeeInventoryPage'))

function L({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<L><LoginPage /></L>} />
        <Route path="/auth/callback" element={<L><AuthCallbackPage /></L>} />
      </Route>
      <Route path="/apply/:vacancyUid" element={<L><CandidateApplyPage /></L>} />
      <Route element={<AuthGuard><SidebarLayout /></AuthGuard>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<L><DashboardPage /></L>} />
        <Route path="/lifecycle/contratacion" element={<L><HiringStagePage /></L>} />
        <Route path="/lifecycle/administracion" element={<L><AdministrationStagePage /></L>} />
        <Route path="/lifecycle/retiro" element={<L><OffboardingStagePage /></L>} />
        <Route path="/employees" element={<L><EmployeeListPage /></L>} />
        <Route path="/employees/:id" element={<L><EmployeeDetailPage /></L>} />
        <Route path="/inventory" element={<L><InventoryPage /></L>} />
        <Route path="/vacancies" element={<L><VacanciesPage /></L>} />
        <Route path="/contracts" element={<L><ContractsPage /></L>} />
        <Route path="/employee-files" element={<L><EmployeeFilesPage /></L>} />
        <Route path="/workflow-automation" element={<L><WorkflowAutomationPage /></L>} />
        <Route path="/onboarding-ops" element={<L><OnboardingOpsPage /></L>} />
        <Route path="/benefits" element={<L><BenefitsExpensesPage /></L>} />
        <Route path="/compliance" element={<L><CompliancePage /></L>} />
        <Route path="/performance" element={<L><PerformancePage /></L>} />
        <Route path="/access" element={<L><AccessProvisioningPage /></L>} />
        <Route path="/helpdesk" element={<L><HelpdeskPage /></L>} />
        <Route path="/org-planning" element={<L><OrgPlanningPage /></L>} />
        <Route path="/integrations" element={<L><IntegrationsPage /></L>} />
        <Route path="/attendance" element={<L><AttendancePage /></L>} />
        <Route path="/payroll/overtime" element={<L><OvertimeRulesPage /></L>} />
        <Route path="/payroll/calculator" element={<L><OvertimeCalculatorPage /></L>} />
        <Route path="/payroll/liquidation" element={<L><PayrollLiquidationPage /></L>} />
        <Route path="/requests" element={<L><RequestApprovalPage /></L>} />
        <Route path="/sanctions" element={<L><SanctionsPage /></L>} />
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
        <Route path="/employee/inventory" element={<L><EmployeeInventoryPage /></L>} />
        <Route path="/employee/notifications" element={<L><EmployeeNotificationsPage /></L>} />
        <Route path="/employee/payments" element={<L><EmployeePaymentsPage /></L>} />
        <Route path="/employee/profile" element={<L><UserProfilePage /></L>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
