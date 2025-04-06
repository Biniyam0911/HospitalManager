import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PatientFlowChart: React.FC = () => {
  // Sample data for the chart
  const data = [
    { day: 'Mon', admitted: 12, discharged: 8, outpatient: 45 },
    { day: 'Tue', admitted: 19, discharged: 11, outpatient: 50 },
    { day: 'Wed', admitted: 15, discharged: 14, outpatient: 55 },
    { day: 'Thu', admitted: 18, discharged: 16, outpatient: 42 },
    { day: 'Fri', admitted: 14, discharged: 12, outpatient: 48 },
    { day: 'Sat', admitted: 8, discharged: 10, outpatient: 30 },
    { day: 'Sun', admitted: 5, discharged: 7, outpatient: 25 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-borderColor shadow-sm rounded-md">
          <p className="font-medium text-textDark">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="admitted" name="Admitted" fill="#2196F3" />
        <Bar dataKey="discharged" name="Discharged" fill="#4CAF50" />
        <Bar dataKey="outpatient" name="Outpatient" fill="#9E9E9E" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PatientFlowChart;
