import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import CompanyRegistration from "@/pages/company-registration";
import CreditRequest from "@/pages/credit-request";
import BackofficeLogin from "@/pages/backoffice/login";
import BackofficeDashboard from "@/pages/backoffice/dashboard";
import BackofficeCompanies from "@/pages/backoffice/companies";
import BackofficeCreditRequests from "@/pages/backoffice/credit-requests";
import AdminUsers from "@/pages/backoffice/admin-users";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/company-registration" component={CompanyRegistration} />
      <Route path="/credit-request/:companyId" component={CreditRequest} />
      <Route path="/backoffice" component={BackofficeLogin} />
      <Route path="/backoffice/login" component={BackofficeLogin} />
      <Route path="/backoffice/dashboard" component={BackofficeDashboard} />
      <Route path="/backoffice/companies" component={BackofficeCompanies} />
      <Route path="/backoffice/credit-requests" component={BackofficeCreditRequests} />
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
