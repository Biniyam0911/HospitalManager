import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Patients from "@/pages/patients/Patients";
import PatientForm from "@/pages/patients/PatientForm";
import PatientEMR from "@/pages/patients/PatientEMR";
import InpatientEMR from "@/pages/inpatient/InpatientEMR";
import EMR from "@/pages/EMR";
import Appointments from "@/pages/appointments/Appointments";
import AppointmentForm from "@/pages/appointments/AppointmentForm";
import Staff from "@/pages/staff/Staff";
import StaffForm from "@/pages/staff/StaffForm";
import Beds from "@/pages/inpatient/Beds";
import Inventory from "@/pages/inventory/Inventory";
import Billing from "@/pages/billing/Billing";
import Payments from "@/pages/billing/Payments";
import Checkout from "@/pages/billing/Checkout";
import CreditCompanies from "@/pages/billing/CreditCompanies";
import Services from "@/pages/services/Services";
import PriceHistory from "@/pages/services/PriceHistory";
import ServiceOrders from "@/pages/services/ServiceOrders";
import Reports from "@/pages/reports/Reports";
import LabSystems from "@/pages/laboratory/LabSystems";
import LabResults from "@/pages/laboratory/LabResults";
import SyncLogs from "@/pages/laboratory/SyncLogs";
import Login from "@/pages/Login";
import HR from "@/pages/hr/HR";
import EmployeeForm from "@/pages/hr/EmployeeForm";
import LeaveRequests from "@/pages/hr/LeaveRequests";
import LeaveRequestForm from "@/pages/hr/LeaveRequestForm";
import Payroll from "@/pages/hr/Payroll";
import Emergency from "@/pages/emergency/Emergency";
import EmergencyForm from "@/pages/emergency/EmergencyForm";
import DialysisUnits from "@/pages/dialysis/DialysisUnits";
import DialysisSessions from "@/pages/dialysis/DialysisSessions";
import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "./lib/auth";
import QuickRegistration from "@/pages/emergency/QuickRegistration";
import ImagingStudies from "@/pages/imaging/ImagingStudies"; // Added import


// Protected route component
function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route path="/">
        <AppLayout>
          <ProtectedRoute component={Dashboard} />
        </AppLayout>
      </Route>

      <Route path="/emr">
        <AppLayout>
          <ProtectedRoute component={EMR} />
        </AppLayout>
      </Route>

      <Route path="/patients">
        <AppLayout>
          <ProtectedRoute component={Patients} />
        </AppLayout>
      </Route>

      <Route path="/patients/new">
        <AppLayout>
          <ProtectedRoute component={PatientForm} />
        </AppLayout>
      </Route>

      <Route path="/patients/:id">
        {(params) => (
          <AppLayout>
            <ProtectedRoute component={PatientForm} id={params.id} />
          </AppLayout>
        )}
      </Route>

      <Route path="/patients/:id/emr">
        {(params) => (
          <AppLayout>
            <ProtectedRoute component={PatientEMR} id={params.id} />
          </AppLayout>
        )}
      </Route>

      <Route path="/inpatient/:id/emr">
        {(params) => (
          <AppLayout>
            <ProtectedRoute component={InpatientEMR} id={params.id} />
          </AppLayout>
        )}
      </Route>

      <Route path="/appointments">
        <AppLayout>
          <ProtectedRoute component={Appointments} />
        </AppLayout>
      </Route>

      <Route path="/emergency">
        <AppLayout>
          <ProtectedRoute component={Emergency} />
        </AppLayout>
      </Route>

      <Route path="/dialysis/units">
        <AppLayout>
          <ProtectedRoute component={DialysisUnits} />
        </AppLayout>
      </Route>

      <Route path="/dialysis/sessions">
        <AppLayout>
          <ProtectedRoute component={DialysisSessions} />
        </AppLayout>
      </Route>

      <Route path="/emergency/new-case">
        <AppLayout>
          <ProtectedRoute component={EmergencyForm} />
        </AppLayout>
      </Route>

      <Route path="/emergency/quick-registration">
        <AppLayout>
          <ProtectedRoute component={QuickRegistration} />
        </AppLayout>
      </Route>

      <Route path="/appointments/new">
        <AppLayout>
          <ProtectedRoute component={AppointmentForm} />
        </AppLayout>
      </Route>

      <Route path="/appointments/:id">
        {(params) => (
          <AppLayout>
            <ProtectedRoute component={AppointmentForm} id={params.id} />
          </AppLayout>
        )}
      </Route>

      <Route path="/staff">
        <AppLayout>
          <ProtectedRoute component={Staff} />
        </AppLayout>
      </Route>

      <Route path="/staff/new">
        <AppLayout>
          <ProtectedRoute component={StaffForm} />
        </AppLayout>
      </Route>

      <Route path="/inpatient/beds">
        <AppLayout>
          <ProtectedRoute component={Beds} />
        </AppLayout>
      </Route>

      <Route path="/inventory">
        <AppLayout>
          <ProtectedRoute component={Inventory} />
        </AppLayout>
      </Route>

      <Route path="/billing">
        <AppLayout>
          <ProtectedRoute component={Billing} />
        </AppLayout>
      </Route>

      <Route path="/billing/payments">
        <AppLayout>
          <ProtectedRoute component={Payments} />
        </AppLayout>
      </Route>

      <Route path="/billing/checkout">
        <AppLayout>
          <ProtectedRoute component={Checkout} />
        </AppLayout>
      </Route>

      <Route path="/billing/credit-companies">
        <AppLayout>
          <ProtectedRoute component={CreditCompanies} />
        </AppLayout>
      </Route>

      <Route path="/services">
        <AppLayout>
          <ProtectedRoute component={Services} />
        </AppLayout>
      </Route>

      <Route path="/services/price-history/:serviceId">
        {(params) => (
          <AppLayout>
            <ProtectedRoute component={PriceHistory} serviceId={params.serviceId} />
          </AppLayout>
        )}
      </Route>

      <Route path="/services/orders">
        <AppLayout>
          <ProtectedRoute component={ServiceOrders} />
        </AppLayout>
      </Route>

      <Route path="/reports">
        <AppLayout>
          <ProtectedRoute component={Reports} />
        </AppLayout>
      </Route>

      <Route path="/laboratory/systems">
        <AppLayout>
          <ProtectedRoute component={LabSystems} />
        </AppLayout>
      </Route>

      <Route path="/laboratory/results">
        <AppLayout>
          <ProtectedRoute component={LabResults} />
        </AppLayout>
      </Route>

      <Route path="/laboratory/sync-logs">
        <AppLayout>
          <ProtectedRoute component={SyncLogs} />
        </AppLayout>
      </Route>
      <Route path="/hr">
        <AppLayout>
          <ProtectedRoute component={HR} />
        </AppLayout>
      </Route>
      <Route path="/hr/new" component={EmployeeForm} />
      <Route path="/hr/leaves" component={LeaveRequests} />
      <Route path="/hr/leave-request" component={LeaveRequestForm} />
      <Route path="/hr/payroll" component={Payroll} />
      <Route path="/imaging/studies" component={ImagingStudies} /> {/* Added route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;