import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/dashboard/StatCard";
import PatientFlowChart from "@/components/dashboard/PatientFlowChart";
import AppointmentsList from "@/components/dashboard/AppointmentsList";
import RecentPatients from "@/components/dashboard/RecentPatients";
import ResourceUtilization from "@/components/dashboard/ResourceUtilization";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard-stats"],
  });

  const { data: resourceUtilization, isLoading: isLoadingResources } = useQuery({
    queryKey: ["/api/resource-utilization"],
  });

  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["/api/appointments/today"],
  });

  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["/api/patients/recent"],
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-textDark">Dashboard</h1>
        <p className="text-midGrey">Hospital overview and key metrics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoadingStats ? (
          <>
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Patients"
              value={dashboardStats?.totalPatients}
              trend={dashboardStats?.patientGrowth}
              trendLabel="this month"
              icon="users"
            />
            <StatCard
              title="Today's Appointments"
              value={dashboardStats?.todayAppointments}
              trend={dashboardStats?.appointmentChange}
              trendLabel="vs last week"
              icon="calendar"
              trendDirection={dashboardStats?.appointmentChange >= 0 ? "up" : "down"}
            />
            <StatCard
              title="Available Beds"
              value={`${dashboardStats?.availableBeds}/${dashboardStats?.totalBeds}`}
              subValue={`${100 - Math.round((dashboardStats?.availableBeds / dashboardStats?.totalBeds) * 100)}% occupancy rate`}
              icon="bed"
            />
            <StatCard
              title="Today's Revenue"
              value={`$${dashboardStats?.todayRevenue}`}
              trend={dashboardStats?.revenueGrowth}
              trendLabel="vs yesterday"
              icon="currency"
            />
          </>
        )}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Flow Chart */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border border-borderColor">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-textDark">Patient Flow</h3>
            <div className="flex space-x-2">
              <select className="text-sm border border-borderColor rounded-md px-2 py-1">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
          </div>
          <div className="h-64">
            <PatientFlowChart />
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-borderColor">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-textDark">Today's Appointments</h3>
            <a href="/appointments" className="text-primary text-sm hover:underline">View all</a>
          </div>
          <div className="space-y-4">
            {isLoadingAppointments ? (
              <>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </>
            ) : (
              <AppointmentsList appointments={appointments || []} />
            )}
          </div>
        </div>
      </div>

      {/* Third Row Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Patients */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-borderColor">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-textDark">Recent Patients</h3>
            <a href="/patients" className="text-primary text-sm hover:underline">View all</a>
          </div>
          {isLoadingPatients ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <RecentPatients patients={patients || []} />
          )}
        </div>

        {/* Resource Utilization */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-borderColor">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-textDark">Resource Utilization</h3>
            <a href="/resources" className="text-primary text-sm hover:underline">View details</a>
          </div>
          
          {isLoadingResources ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResourceUtilization data={resourceUtilization || {}} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
