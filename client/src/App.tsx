import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { InstallPWASimple } from "@/components/install-pwa-simple";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import UserTypeSelection from "@/pages/user-type-selection";
import RegisterEntrepreneur from "@/pages/register-entrepreneur";
import RegisterInvestor from "@/pages/register-investor";
import Dashboard from "@/pages/dashboard-modern";
import InvestorDashboard from "@/pages/investor-dashboard-modern";
import CompanyRegistration from "@/pages/company-registration";
import CreditRequest from "@/pages/credit-request";
import Profile from "@/pages/profile";
import InvestorCompanyRegistration from "@/pages/investor-company-registration";
import BackofficeLogin from "@/pages/backoffice/login";
import BackofficeDashboard from "@/pages/backoffice/dashboard";
import BackofficeCompanies from "@/pages/backoffice/companies";
import BackofficeCreditRequests from "@/pages/backoffice/credit-requests";
import AdminUsers from "@/pages/backoffice/admin-users";
import AuditPage from "@/pages/backoffice/audit";
import Messages from "@/pages/messages";
import BackofficeMessages from "@/pages/backoffice/messages";
import BackofficeInvestors from "@/pages/backoffice/investors";
import BackofficeEntrepreneurs from "@/pages/backoffice/entrepreneurs";
import BackofficeNetwork from "@/pages/backoffice/network";
import BackofficeApprovals from "@/pages/backoffice/approvals";
import BackofficeNotifications from "@/pages/backoffice/notifications";
import BackofficePendingChanges from "@/pages/backoffice-pending-changes";
import CompanyEdit from "@/pages/company-edit";
import CompanyDetail from "@/pages/company-detail";
import ValuationPage from "@/pages/valuation";
import InvestorNetworkPage from "@/pages/investor-network";
import InvestorProfile from "@/pages/investor/profile";
import InvestorMessages from "@/pages/investor/messages";
import InvestorCreditRequests from "@/pages/investor/credit-requests";
import InvestorCompanyEdit from "@/pages/investor-company-edit";
import Companies from "@/pages/companies";
import CreditRequests from "@/pages/credit-requests";
import Network from "@/pages/network";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import { ConfirmEmailPage } from "@/pages/confirm-email";
import LandingPageCadastro from "@/pages/landing-page-cadastro";

function Router() {
  return (
    <Switch>
      <Route path="/" component={UserTypeSelection} />
      <Route path="/landpagecadastro" component={LandingPageCadastro} />
      <Route path="/user-type-selection" component={UserTypeSelection} />
      <Route path="/register/entrepreneur" component={RegisterEntrepreneur} />
      <Route path="/register/investor" component={RegisterInvestor} />
      <Route path="/login/entrepreneur" component={Login} />
      <Route path="/login/investor" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/forgot-password/entrepreneur" component={ForgotPassword} />
      <Route path="/forgot-password/investor" component={ForgotPassword} />
      <Route path="/forgot-password/admin" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/confirm-email" component={ConfirmEmailPage} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/investor-dashboard" component={InvestorDashboard} />
      <Route path="/investor/dashboard" component={InvestorDashboard} />
      <Route path="/investor/network" component={InvestorNetworkPage} />
      <Route path="/company-registration" component={CompanyRegistration} />
      <Route path="/nova-empresa" component={CompanyRegistration} />
      <Route path="/company-edit/:id" component={CompanyEdit} />
      <Route path="/empresa/:id" component={CompanyDetail} />
      <Route path="/empresa/:id/editar" component={CompanyEdit} />
      <Route path="/companies/:companyId/valuation/:valuationId?" component={ValuationPage} />
      <Route path="/investor-company-registration" component={InvestorCompanyRegistration} />
      <Route path="/credit-request/:companyId" component={CreditRequest} />
      <Route path="/nova-solicitacao" component={CreditRequest} />
      <Route path="/companies" component={Companies} />
      <Route path="/credit-requests" component={CreditRequests} />
      <Route path="/network" component={Network} />
      <Route path="/messages" component={Messages} />
      <Route path="/profile" component={Profile} />
      <Route path="/investor/profile" component={InvestorProfile} />
      <Route path="/investor/messages" component={InvestorMessages} />
      <Route path="/investor/credit-requests" component={InvestorCreditRequests} />
      <Route path="/investor/company/edit" component={InvestorCompanyEdit} />
      <Route path="/backoffice" component={BackofficeDashboard} />
      <Route path="/backoffice/login" component={BackofficeLogin} />
      <Route path="/backoffice/dashboard" component={BackofficeDashboard} />
      <Route path="/backoffice/approvals" component={BackofficeApprovals} />
      <Route path="/backoffice/companies" component={BackofficeCompanies} />
      <Route path="/backoffice/credit-requests" component={BackofficeCreditRequests} />
      <Route path="/backoffice/investors" component={BackofficeInvestors} />
      <Route path="/backoffice/entrepreneurs" component={BackofficeEntrepreneurs} />
      <Route path="/backoffice/network" component={BackofficeNetwork} />
      <Route path="/backoffice/admin-users" component={AdminUsers} />
      <Route path="/backoffice/audit" component={AuditPage} />
      <Route path="/backoffice/messages" component={BackofficeMessages} />
      <Route path="/backoffice/notifications" component={BackofficeNotifications} />
      <Route path="/backoffice/pending-changes" component={BackofficePendingChanges} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="investme-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
          <InstallPWASimple />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
