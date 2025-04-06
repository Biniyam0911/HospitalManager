import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, MoreHorizontal, FileEdit, Trash, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

const Appointments = () => {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Get patient name from patient ID
  const getPatientName = (patientId: number) => {
    if (!patients) return "Loading...";
    const patient = patients.find((p: any) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`;
  };

  // Get doctor name from doctor ID
  const getDoctorName = (doctorId: number) => {
    if (!users) return "Loading...";
    const doctor = users.find((u: any) => u.id === doctorId);
    return doctor ? doctor.name : `Doctor #${doctorId}`;
  };

  // Filter appointments based on search term and status
  const filteredAppointments = appointments
    ? appointments.filter((appointment: any) => {
        // Filter by status
        if (filterStatus !== "all" && appointment.status !== filterStatus) {
          return false;
        }

        // If no patients data, don't filter by search
        if (!patients) return true;

        // Find patient for this appointment
        const patient = patients.find((p: any) => p.id === appointment.patientId);
        if (!patient) return true;

        const patientFullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const doctor = users?.find((u: any) => u.id === appointment.doctorId);
        const doctorName = doctor ? doctor.name.toLowerCase() : "";
        const type = appointment.type.toLowerCase();
        
        // Search in patient name, doctor name, appointment type
        return (
          patientFullName.includes(searchTerm.toLowerCase()) ||
          doctorName.includes(searchTerm.toLowerCase()) ||
          type.includes(searchTerm.toLowerCase())
        );
      })
    : [];

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-primary/10 text-primary";
      case "completed":
        return "bg-secondary/10 text-secondary";
      case "cancelled":
        return "bg-alert/10 text-alert";
      case "no-show":
        return "bg-gray-200 text-gray-600";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  const getAppointmentTypeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case "checkup":
        return "bg-primary/10 text-primary";
      case "follow-up":
        return "bg-secondary/10 text-secondary";
      case "emergency":
        return "bg-alert/10 text-alert";
      case "consultation":
        return "bg-primary/10 text-primary";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-textDark">Appointments</h1>
          <p className="text-midGrey">Manage patient appointments</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => navigate("/appointments/new")}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-borderColor">
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-midGrey h-4 w-4" />
            <Input
              type="search"
              placeholder="Search appointments..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no-show">No-show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-midGrey">
                      {searchTerm ? "No appointments found matching your search" : "No appointments found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment: any) => (
                    <TableRow key={appointment.id} className="hover:bg-neutral">
                      <TableCell className="font-medium">
                        {getPatientName(appointment.patientId)}
                      </TableCell>
                      <TableCell>{getDoctorName(appointment.doctorId)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDate(appointment.date, "MMM dd, yyyy")}</span>
                          <span className="text-midGrey text-sm">{formatDate(appointment.date, "hh:mm a")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${getAppointmentTypeClass(appointment.type)}`}>
                          {appointment.type}
                        </span>
                      </TableCell>
                      <TableCell>{appointment.duration} mins</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/appointments/${appointment.id}`)}>
                              <FileEdit className="h-4 w-4 mr-2" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert("Feature not implemented")}>
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Reschedule</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert("Feature not implemented")}>
                              <Trash className="h-4 w-4 mr-2" />
                              <span>Cancel</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appointments;
