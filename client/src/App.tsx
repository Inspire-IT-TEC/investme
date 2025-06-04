import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import UserTypeSelection from "@/pages/user-type-selection";
import RegisterEntrepreneur from "@/pages/register-entrepreneur";
import RegisterInvestor from "@/pages/register-investor";
import Dashboard from "@/pages/dashboard";
import InvestorDashboard from "@/pages/investor-dashboard";
import CompanyRegistration from "@/pages/company-registration";
import CreditRequest from "@/pages/credit-request";
import BackofficeLogin from "@/pages/backoffice/login";
import BackofficeDashboard from "@/pages/backoffice/dashboard";
import BackofficeCompanies from "@/pages/backoffice/companies";
import BackofficeCreditRequests from "@/pages/backoffice/credit-requests";
import AdminUsers from "@/pages/backoffice/admin-users";
import AuditPage from "@/pages/backoffice/audit";
import Messages from "@/pages/messages";
import BackofficeMessages from "@/pages/backoffice/messages";
import BackofficeInvestors from "@/pages/backoffice/investors";
import BackofficeNetwork from "@/pages/backoffice/network";
import BackofficeApprovals from "@/pages/backoffice/approvals";

function Router() {
  return (
    <Switch>
      <Route path="/" component={UserTypeSelection} />
      <Route path="/user-type-selection" component={UserTypeSelection} />
      <Route path="/register/entrepreneur" component={RegisterEntrepreneur} />
      <Route path="/register/investor" component={RegisterInvestor} />
      <Route path="/login/entrepreneur" component={Login} />
      <Route path="/login/investor" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/investor/dashboard" component={InvestorDashboard} />
      <Route path="/company-registration" component={CompanyRegistration} />
      <Route path="/credit-request/:companyId" component={CreditRequest} />
      <Route path="/messages" component={Messages} />
      <Route path="/backoffice" component={BackofficeLogin} />
      <Route path="/backoffice/login" component={BackofficeLogin} />
      <Route path="/backoffice/dashboard" component={BackofficeDashboard} />
      <Route path="/backoffice/approvals" component={BackofficeApprovals} />
      <Route path="/backoffice/companies" component={BackofficeCompanies} />
      <Route path="/backoffice/credit-requests" component={BackofficeCreditRequests} />
      <Route path="/backoffice/investors" component={BackofficeInvestors} />
      <Route path="/backoffice/network" component={BackofficeNetwork} />
      <Route path="/backoffice/admin-users" component={AdminUsers} />
      <Route path="/backoffice/audit" component={AuditPage} />
      <Route path="/backoffice/messages" component={BackofficeMessages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
