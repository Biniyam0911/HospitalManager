interface ResourceUtilizationProps {
  data: {
    bedUtilization?: number;
    staffAllocation?: number;
    emergencyCapacity?: number;
    operatingRoomUsage?: number;
    pharmacyInventory?: number;
  };
}

const ResourceUtilization: React.FC<ResourceUtilizationProps> = ({ data }) => {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-alert";
    if (percentage >= 70) return "bg-secondary";
    return "bg-primary";
  };

  const resources = [
    { name: "Bed Utilization", value: data.bedUtilization || 0 },
    { name: "Staff Allocation", value: data.staffAllocation || 0 },
    { name: "Emergency Capacity", value: data.emergencyCapacity || 0 },
    { name: "Operating Room Usage", value: data.operatingRoomUsage || 0 },
    { name: "Pharmacy Inventory", value: data.pharmacyInventory || 0 },
  ];

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <div key={resource.name}>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-textDark">{resource.name}</span>
            <span className="text-sm text-textDark">{resource.value}%</span>
          </div>
          <div className="w-full bg-neutral rounded-full h-2.5">
            <div 
              className={`${getProgressColor(resource.value)} h-2.5 rounded-full`} 
              style={{ width: `${resource.value}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourceUtilization;
