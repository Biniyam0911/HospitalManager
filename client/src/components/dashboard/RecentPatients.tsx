import { formatDate } from "@/lib/utils";

interface Patient {
  id: number;
  patientId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
}

interface RecentPatientsProps {
  patients: Patient[];
}

const RecentPatients: React.FC<RecentPatientsProps> = ({ patients }) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-secondary bg-opacity-10 text-secondary';
      case 'discharged':
        return 'bg-alert bg-opacity-10 text-alert';
      case 'scheduled':
        return 'bg-primary bg-opacity-10 text-primary';
      default:
        return 'bg-midGrey bg-opacity-10 text-midGrey';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-borderColor">
        <thead>
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-midGrey uppercase tracking-wider">Patient</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-midGrey uppercase tracking-wider">ID</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-midGrey uppercase tracking-wider">Date</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-midGrey uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-borderColor">
          {patients.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-4 text-center text-midGrey">
                No patients found
              </td>
            </tr>
          ) : (
            patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-neutral">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary">
                      <span>{getInitials(patient.firstName, patient.lastName)}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-textDark">{`${patient.firstName} ${patient.lastName}`}</p>
                      <p className="text-xs text-midGrey">{patient.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-textDark">{patient.patientId}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-midGrey">
                  {formatDate(patient.createdAt, "MMM dd, yyyy")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(patient.status)}`}>
                    {patient.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentPatients;
