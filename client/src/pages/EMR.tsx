import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, User, Users, Hotel, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

const EMR = () => {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("outpatients");

  // Fetch patients data
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Fetch admissions data for inpatients
  const { data: admissions = [], isLoading: isLoadingAdmissions } = useQuery({
    queryKey: ["/api/admissions"],
  });

  // Filter patients based on search term
  const filteredPatients = Array.isArray(patients) ? patients.filter((patient: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.patientId.toLowerCase().includes(searchLower) ||
      (patient.email && patient.email.toLowerCase().includes(searchLower))
    );
  }) : [];

  // Find active admissions and join with patient data
  const activeAdmissions = Array.isArray(admissions) ? admissions.filter((admission: any) => 
    admission.status && admission.status.toLowerCase() === "active"
  ) : [];

  // Match patients with their admissions
  const inpatients = activeAdmissions.map((admission: any) => {
    const patient = Array.isArray(patients) ? patients.find((p: any) => p.id === admission.patientId) : null;
    return {
      ...admission,
      patient,
    };
  });

  // Filter inpatients based on search term
  const filteredInpatients = Array.isArray(inpatients) ? inpatients.filter((inpatient: any) => {
    if (!inpatient.patient) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      inpatient.patient.firstName.toLowerCase().includes(searchLower) ||
      inpatient.patient.lastName.toLowerCase().includes(searchLower) ||
      inpatient.patient.patientId.toLowerCase().includes(searchLower) ||
      (inpatient.patient.email && inpatient.patient.email.toLowerCase().includes(searchLower))
    );
  }) : [];

  // Status badge color utility
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-secondary/10 text-secondary";
      case "discharged":
        return "bg-alert/10 text-alert";
      case "scheduled":
        return "bg-primary/10 text-primary";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Electronic Medical Records</h1>
          <p className="text-gray-500">Access and manage patient medical records</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search patients by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs 
        defaultValue="outpatients" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="outpatients" className="flex items-center justify-center">
            <Users className="h-4 w-4 mr-2" />
            Outpatients
          </TabsTrigger>
          <TabsTrigger value="inpatients" className="flex items-center justify-center">
            <Hotel className="h-4 w-4 mr-2" />
            Inpatients
          </TabsTrigger>
        </TabsList>

        {/* Outpatients Tab */}
        <TabsContent value="outpatients">
          <div className="grid grid-cols-1 gap-4">
            {isLoadingPatients ? (
              <div className="text-center py-8">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No patients match your search criteria." : "No patients found."}
              </div>
            ) : (
              filteredPatients.map((patient: any) => (
                <Card key={patient.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle>{patient.firstName} {patient.lastName}</CardTitle>
                          <p className="text-sm text-gray-500">ID: {patient.patientId}</p>
                        </div>
                      </div>
                      <Badge className={getStatusBadgeClass(patient.status)}>
                        {patient.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Gender</p>
                        <p>{patient.gender || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                        <p>{patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact</p>
                        <p>{patient.phone || patient.email || "Not specified"}</p>
                      </div>
                    </div>
                  </CardContent>
                  <Separator />
                  <CardFooter className="pt-3 flex justify-between">
                    <Button 
                      variant="ghost" 
                      className="flex items-center"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      View Patient
                    </Button>
                    <Button 
                      className="flex items-center"
                      onClick={() => navigate(`/patients/${patient.id}/emr`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Access EMR
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Inpatients Tab */}
        <TabsContent value="inpatients">
          <div className="grid grid-cols-1 gap-4">
            {isLoadingAdmissions || isLoadingPatients ? (
              <div className="text-center py-8">Loading inpatients...</div>
            ) : filteredInpatients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No inpatients match your search criteria." : "No active inpatients found."}
              </div>
            ) : (
              filteredInpatients.map((inpatient: any) => {
                if (!inpatient.patient) return null;
                
                return (
                  <Card key={inpatient.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                            <Hotel className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle>{inpatient.patient.firstName} {inpatient.patient.lastName}</CardTitle>
                            <p className="text-sm text-gray-500">
                              ID: {inpatient.patient.patientId} | Admission #{inpatient.id}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusBadgeClass(inpatient.status)}>
                          {inpatient.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Admitted On</p>
                          <p>{formatDate(inpatient.admissionDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Duration</p>
                          <p>{getDurationDays(inpatient.admissionDate)} days</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Diagnosis</p>
                          <p>{inpatient.diagnosis || "Not specified"}</p>
                        </div>
                      </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="pt-3 flex justify-between">
                      <Button 
                        variant="ghost" 
                        className="flex items-center"
                        onClick={() => navigate(`/patients/${inpatient.patientId}`)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        View Patient
                      </Button>
                      <Button 
                        className="flex items-center"
                        onClick={() => navigate(`/inpatient/${inpatient.id}/emr`)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Access EMR
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to calculate duration in days
function getDurationDays(startDate: string | Date): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default EMR;