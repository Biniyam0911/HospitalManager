import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, User, Calendar, Bed } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

const Beds = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [admissionDialogOpen, setAdmissionDialogOpen] = useState(false);
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState<string>("all");
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    diagnosis: "",
    deposit: "0"
  });

  // Fetch beds data
  const { data: beds = [], isLoading: isLoadingBeds } = useQuery({
    queryKey: ["/api/beds"],
  });

  // Fetch wards data
  const { data: wards = [], isLoading: isLoadingWards } = useQuery({
    queryKey: ["/api/wards"],
  });

  // Fetch patients data for admission
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Fetch staff data for admission
  const { data: doctors = [], isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["/api/users"],
  });

  // Fetch active admissions
  const { data: admissions = [], isLoading: isLoadingAdmissions } = useQuery({
    queryKey: ["/api/admissions"],
  });

  // Create admission mutation
  const createAdmissionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admissions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/beds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admissions"] });
      setAdmissionDialogOpen(false);
      toast({
        title: "Success",
        description: "Patient admitted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to admit patient: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Discharge patient mutation
  const dischargePatientMutation = useMutation({
    mutationFn: async (admissionId: number) => {
      return apiRequest("PATCH", `/api/admissions/${admissionId}`, {
        status: "discharged",
        dischargeDate: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/beds"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admissions"] });
      setDischargeDialogOpen(false);
      toast({
        title: "Success",
        description: "Patient discharged successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to discharge patient: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filtered beds based on search and ward filter
  const filteredBeds = beds
    ? beds.filter((bed: any) => {
        if (selectedWard !== "all" && bed.wardId.toString() !== selectedWard) {
          return false;
        }
        return bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  // Get ward name by ID
  const getWardName = (wardId: number) => {
    if (!wards) return "Loading...";
    const ward = wards.find((w: any) => w.id === wardId);
    return ward ? ward.name : `Ward #${wardId}`;
  };

  // Get patient name by ID
  const getPatientName = (patientId: number) => {
    if (!patients) return "Loading...";
    const patient = patients.find((p: any) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`;
  };

  // Get admission for a bed
  const getBedAdmission = (bedId: number) => {
    if (!admissions) return null;
    return admissions.find((a: any) => a.bedId === bedId && a.status === "active");
  };

  // Handle admission form submission
  const handleAdmitPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;

    createAdmissionMutation.mutate({
      patientId: parseInt(formData.patientId),
      bedId: selectedBed.id,
      doctorId: parseInt(formData.doctorId),
      admissionDate: new Date().toISOString(),
      diagnosis: formData.diagnosis,
      deposit: parseFloat(formData.deposit) || 0,
      status: "active"
    });
  };

  // Handle discharge
  const handleDischargePatient = () => {
    if (!selectedBed) return;
    
    const admission = getBedAdmission(selectedBed.id);
    if (admission) {
      dischargePatientMutation.mutate(admission.id);
    }
  };

  // Filter doctors only
  const doctorsList = doctors?.filter((user: any) => user.role === "doctor") || [];

  const isLoading = isLoadingBeds || isLoadingWards || isLoadingPatients || isLoadingDoctors || isLoadingAdmissions;

  // Group beds by status for tab view
  const availableBeds = filteredBeds.filter((bed: any) => bed.status === "available");
  const occupiedBeds = filteredBeds.filter((bed: any) => bed.status === "occupied");
  const maintenanceBeds = filteredBeds.filter((bed: any) => bed.status === "maintenance");

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-textDark">Bed Management</h1>
          <p className="text-midGrey">Manage inpatient beds and admissions</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => alert("Feature not implemented")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Bed
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Beds</CardTitle>
            <CardDescription>All hospital beds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{beds?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Available Beds</CardTitle>
            <CardDescription>Ready for admission</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {beds?.filter((b: any) => b.status === "available").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Occupied Beds</CardTitle>
            <CardDescription>Currently in use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {beds?.filter((b: any) => b.status === "occupied").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-borderColor mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-midGrey h-4 w-4" />
            <Input
              type="search"
              placeholder="Search beds..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              value={selectedWard}
              onValueChange={setSelectedWard}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by ward" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wards</SelectItem>
                {wards?.map((ward: any) => (
                  <SelectItem key={ward.id} value={ward.id.toString()}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Beds ({filteredBeds.length})</TabsTrigger>
              <TabsTrigger value="available">Available ({availableBeds.length})</TabsTrigger>
              <TabsTrigger value="occupied">Occupied ({occupiedBeds.length})</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance ({maintenanceBeds.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <BedGrid
                beds={filteredBeds}
                wards={wards}
                getWardName={getWardName}
                getBedAdmission={getBedAdmission}
                getPatientName={getPatientName}
                onAdmit={(bed) => {
                  setSelectedBed(bed);
                  setFormData({
                    patientId: "",
                    doctorId: "",
                    diagnosis: "",
                    deposit: "0"
                  });
                  setAdmissionDialogOpen(true);
                }}
                onDischarge={(bed) => {
                  setSelectedBed(bed);
                  setDischargeDialogOpen(true);
                }}
              />
            </TabsContent>
            
            <TabsContent value="available" className="mt-0">
              <BedGrid
                beds={availableBeds}
                wards={wards}
                getWardName={getWardName}
                getBedAdmission={getBedAdmission}
                getPatientName={getPatientName}
                onAdmit={(bed) => {
                  setSelectedBed(bed);
                  setFormData({
                    patientId: "",
                    doctorId: "",
                    diagnosis: "",
                    deposit: "0"
                  });
                  setAdmissionDialogOpen(true);
                }}
                onDischarge={(bed) => {
                  setSelectedBed(bed);
                  setDischargeDialogOpen(true);
                }}
              />
            </TabsContent>
            
            <TabsContent value="occupied" className="mt-0">
              <BedGrid
                beds={occupiedBeds}
                wards={wards}
                getWardName={getWardName}
                getBedAdmission={getBedAdmission}
                getPatientName={getPatientName}
                onAdmit={(bed) => {
                  setSelectedBed(bed);
                  setFormData({
                    patientId: "",
                    doctorId: "",
                    diagnosis: "",
                    deposit: "0"
                  });
                  setAdmissionDialogOpen(true);
                }}
                onDischarge={(bed) => {
                  setSelectedBed(bed);
                  setDischargeDialogOpen(true);
                }}
              />
            </TabsContent>
            
            <TabsContent value="maintenance" className="mt-0">
              <BedGrid
                beds={maintenanceBeds}
                wards={wards}
                getWardName={getWardName}
                getBedAdmission={getBedAdmission}
                getPatientName={getPatientName}
                onAdmit={(bed) => {
                  setSelectedBed(bed);
                  setFormData({
                    patientId: "",
                    doctorId: "",
                    diagnosis: "",
                    deposit: "0"
                  });
                  setAdmissionDialogOpen(true);
                }}
                onDischarge={(bed) => {
                  setSelectedBed(bed);
                  setDischargeDialogOpen(true);
                }}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Admit Patient Dialog */}
      <Dialog open={admissionDialogOpen} onOpenChange={setAdmissionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admit Patient</DialogTitle>
            <DialogDescription>
              Assign a patient to bed {selectedBed?.bedNumber} in {getWardName(selectedBed?.wardId)}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdmitPatient}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient</label>
                <Select
                  value={formData.patientId}
                  onValueChange={(value) => setFormData({...formData, patientId: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients?.map((patient: any) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {`${patient.firstName} ${patient.lastName} (${patient.patientId})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Attending Doctor</label>
                <Select
                  value={formData.doctorId}
                  onValueChange={(value) => setFormData({...formData, doctorId: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorsList.map((doctor: any) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Diagnosis</label>
                <Input
                  placeholder="Enter diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Deposit ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter deposit amount"
                  value={formData.deposit}
                  onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setAdmissionDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createAdmissionMutation.isPending}>
                {createAdmissionMutation.isPending ? "Admitting..." : "Admit Patient"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Discharge Patient Dialog */}
      <Dialog open={dischargeDialogOpen} onOpenChange={setDischargeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Discharge Patient</DialogTitle>
            <DialogDescription>
              {selectedBed && (
                <>
                  Are you sure you want to discharge 
                  {" "}
                  {getPatientName(getBedAdmission(selectedBed.id)?.patientId)} 
                  {" "}
                  from bed {selectedBed.bedNumber}?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDischargeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleDischargePatient}
              disabled={dischargePatientMutation.isPending}
            >
              {dischargePatientMutation.isPending ? "Discharging..." : "Discharge Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Bed Grid Component
const BedGrid = ({ 
  beds, 
  wards, 
  getWardName, 
  getBedAdmission, 
  getPatientName,
  onAdmit,
  onDischarge
}: any) => {
  const getBedStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-secondary/10 text-secondary";
      case "occupied":
        return "bg-primary/10 text-primary";
      case "maintenance":
        return "bg-alert/10 text-alert";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  if (beds.length === 0) {
    return (
      <div className="text-center p-6 bg-neutral/30 rounded-lg">
        <p className="text-midGrey">No beds found matching your criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {beds.map((bed: any) => {
        const admission = getBedAdmission(bed.id);
        return (
          <Card key={bed.id} className="overflow-hidden">
            <CardHeader className="bg-neutral/50 p-4">
              <CardTitle className="text-base flex justify-between items-center">
                <span>{bed.bedNumber}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getBedStatusColor(bed.status)}`}>
                  {bed.status}
                </span>
              </CardTitle>
              <CardDescription>{getWardName(bed.wardId)}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {bed.status === "occupied" && admission ? (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-midGrey" />
                    <span>{getPatientName(admission.patientId)}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-midGrey" />
                    <span>Admitted: {formatDate(admission.admissionDate, "MMM dd, yyyy")}</span>
                  </div>
                  {admission.diagnosis && (
                    <div className="text-sm text-midGrey">
                      <span className="font-medium text-textDark">Diagnosis:</span> {admission.diagnosis}
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full mt-2" 
                    onClick={() => onDischarge(bed)}
                  >
                    Discharge Patient
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <Bed className="h-12 w-12 text-midGrey mb-3" />
                  {bed.status === "available" ? (
                    <>
                      <p className="text-center text-midGrey mb-3">This bed is available for admission</p>
                      <Button className="w-full" onClick={() => onAdmit(bed)}>
                        Admit Patient
                      </Button>
                    </>
                  ) : (
                    <p className="text-center text-midGrey">This bed is under maintenance</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Beds;
