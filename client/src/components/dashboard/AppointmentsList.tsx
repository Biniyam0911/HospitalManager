import { Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  duration: number;
  type: string;
  status: string;
  notes?: string;
}

interface AppointmentsListProps {
  appointments: Appointment[];
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments }) => {
  const getBorderColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checkup':
        return 'border-primary';
      case 'follow-up':
        return 'border-secondary';
      case 'emergency':
        return 'border-alert';
      case 'consultation':
        return 'border-primary';
      default:
        return 'border-primary';
    }
  };

  const getTagColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checkup':
        return 'bg-primary bg-opacity-10 text-primary';
      case 'follow-up':
        return 'bg-secondary bg-opacity-10 text-secondary';
      case 'emergency':
        return 'bg-alert bg-opacity-10 text-alert';
      case 'consultation':
        return 'bg-primary bg-opacity-10 text-primary';
      default:
        return 'bg-primary bg-opacity-10 text-primary';
    }
  };

  // Doctor names mapping - in a real app, you'd fetch this from API
  const doctorNames = {
    1: "Dr. John Doe",
    2: "Dr. Patel",
    3: "Dr. Johnson",
    4: "Dr. Garcia",
  };
  
  // Patient names mapping - in a real app, you'd fetch this from API
  const patientNames = {
    1: "John Doe",
    2: "Maria Johnson",
    3: "Robert Williams",
    4: "Sophia Davis",
  };

  const getDoctorName = (doctorId: number) => {
    return doctorNames[doctorId as keyof typeof doctorNames] || `Dr. #${doctorId}`;
  };
  
  const getPatientName = (patientId: number) => {
    return patientNames[patientId as keyof typeof patientNames] || `Patient #${patientId}`;
  };

  return (
    <div className="space-y-4">
      {appointments.length === 0 ? (
        <p className="text-midGrey text-center py-4">No appointments scheduled for today</p>
      ) : (
        appointments.slice(0, 4).map((appointment) => (
          <div
            key={appointment.id}
            className={`border-l-4 ${getBorderColor(appointment.type)} pl-3 py-2`}
          >
            <div className="flex justify-between">
              <p className="font-medium text-sm">{getPatientName(appointment.patientId)}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${getTagColor(appointment.type)}`}>
                {appointment.type}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-midGrey text-xs flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatDate(appointment.date, "h:mm a")}</span>
              </p>
              <p className="text-midGrey text-xs">{getDoctorName(appointment.doctorId)}</p>
            </div>
          </div>
        ))
      )}

      {appointments.length > 4 && (
        <a href="/appointments" className="block text-center text-sm text-primary py-2 hover:underline">
          View {appointments.length - 4} more appointments
        </a>
      )}
    </div>
  );
};

export default AppointmentsList;
