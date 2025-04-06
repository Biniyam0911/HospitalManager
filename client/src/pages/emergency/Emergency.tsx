
import React from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, AlertCircle, UserPlus } from "lucide-react";

const Emergency = () => {
  const [, navigate] = useLocation();

  const { data: emergencyCases = [] } = useQuery({
    queryKey: ["/api/emergency-cases"],
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Emergency Department</h1>
        <div className="space-x-2">
          <Button onClick={() => navigate("/emergency/quick-registration")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Quick Registration
          </Button>
          <Button onClick={() => navigate("/emergency/new-case")}>
            <Plus className="h-4 w-4 mr-2" />
            New Emergency Case
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {emergencyCases.map((emergency: any) => (
          <Card key={emergency.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className={`h-5 w-5 mr-2 ${
                  emergency.triageLevel === 'red' ? 'text-red-500' :
                  emergency.triageLevel === 'yellow' ? 'text-yellow-500' : 'text-green-500'
                }`} />
                Case #{emergency.id}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Patient: {emergency.patient?.firstName} {emergency.patient?.lastName}</p>
              <p>Chief Complaint: {emergency.chiefComplaint}</p>
              <p>Status: {emergency.status}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" 
                onClick={() => navigate(`/emergency/${emergency.id}`)}>
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Emergency;
