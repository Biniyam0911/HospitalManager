import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search, Calendar, FileText, ExternalLink, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LabResults() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabSystem, setSelectedLabSystem] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("last30");
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const [isResultDetailsOpen, setIsResultDetailsOpen] = useState(false);

  // Fetch lab systems for the filter dropdown
  const { data: labSystems } = useQuery({
    queryKey: ["/api/lab-systems"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lab-systems");
      return response.json();
    },
  });

  // Fetch patients for the filter dropdown
  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/patients");
      return response.json();
    },
  });

  // Fetch lab tests for the filter dropdown
  const { data: labTests } = useQuery({
    queryKey: ["/api/lab-tests"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lab-tests");
      return response.json();
    },
  });

  // Fetch lab results with filters
  const {
    data: labResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/lab-results", selectedLabSystem, selectedPatient, selectedTest, dateRange],
    queryFn: async () => {
      let url = "/api/lab-results";
      const params = [];
      
      if (selectedLabSystem) {
        params.push(`labSystemId=${selectedLabSystem}`);
      }
      
      if (selectedPatient) {
        params.push(`patientId=${selectedPatient}`);
      }
      
      if (selectedTest) {
        params.push(`testCode=${selectedTest}`);
      }
      
      if (dateRange) {
        params.push(`dateRange=${dateRange}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      
      const response = await apiRequest("GET", url);
      return response.json();
    },
  });

  // Filter results by search term
  const filteredResults = labResults?.filter((result: any) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const patient = patients?.find((p: any) => p.id === result.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : "";
    
    return (
      patientName.includes(searchLower) ||
      result.testCode.toLowerCase().includes(searchLower) ||
      result.testName.toLowerCase().includes(searchLower) ||
      (result.notes && result.notes.toLowerCase().includes(searchLower))
    );
  });

  const getResultStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "normal":
        return <Badge className="bg-green-500">Normal</Badge>;
      case "abnormal":
        return <Badge className="bg-yellow-500">Abnormal</Badge>;
      case "critical":
        return <Badge className="bg-red-500">Critical</Badge>;
      case "pending":
        return <Badge className="bg-blue-500">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleViewResultDetails = (result: any) => {
    setSelectedResult(result);
    setIsResultDetailsOpen(true);
  };

  // Format a lab result value with its reference range
  const formatResultValue = (result: any) => {
    if (!result.value) return "N/A";
    
    let formattedValue = `${result.value}`;
    if (result.unit) {
      formattedValue += ` ${result.unit}`;
    }
    
    return formattedValue;
  };

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Laboratory Results</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Lab Results</CardTitle>
          <CardDescription>
            View and search laboratory test results from integrated systems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search results by patient name, test name, or notes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                value={selectedLabSystem}
                onValueChange={setSelectedLabSystem}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lab System" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Lab Systems</SelectItem>
                  {labSystems?.map((system: any) => (
                    <SelectItem key={system.id} value={system.id.toString()}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedPatient}
                onValueChange={setSelectedPatient}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Patients</SelectItem>
                  {patients?.map((patient: any) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedTest}
                onValueChange={setSelectedTest}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Test Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Tests</SelectItem>
                  {labTests?.map((test: any) => (
                    <SelectItem key={test.code} value={test.code}>
                      {test.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={dateRange}
                onValueChange={setDateRange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7">Last 7 Days</SelectItem>
                  <SelectItem value="last30">Last 30 Days</SelectItem>
                  <SelectItem value="last90">Last 90 Days</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="allTime">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLabSystem("");
                  setSelectedPatient("");
                  setSelectedTest("");
                  setDateRange("last30");
                  setSearchTerm("");
                  refetch();
                }}
                className="shrink-0"
              >
                <Filter className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading lab results. Please try again.
            </div>
          ) : filteredResults?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No laboratory results found matching your criteria.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Patient</TableHead>
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead>Test</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Source</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults?.map((result: any) => {
                    const patient = patients?.find((p: any) => p.id === result.patientId);
                    
                    return (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">
                          {patient 
                            ? `${patient.firstName} ${patient.lastName}`
                            : `Patient #${result.patientId}`
                          }
                        </TableCell>
                        <TableCell>
                          {formatDate(result.resultDate, "PPP")}
                        </TableCell>
                        <TableCell>{result.testName}</TableCell>
                        <TableCell>
                          {formatResultValue(result)}
                          {result.referenceRange && (
                            <div className="text-xs text-muted-foreground">
                              Ref: {result.referenceRange}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getResultStatusBadge(result.status)}
                        </TableCell>
                        <TableCell>
                          {labSystems?.find((s: any) => s.id === result.labSystemId)?.name || 
                            `Lab #${result.labSystemId}`}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewResultDetails(result)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Details Dialog */}
      <Dialog open={isResultDetailsOpen} onOpenChange={setIsResultDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Lab Result Details</DialogTitle>
            <DialogDescription>
              Detailed information for laboratory test result
            </DialogDescription>
          </DialogHeader>
          
          {selectedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Patient</h4>
                  <p>
                    {patients?.find((p: any) => p.id === selectedResult.patientId)
                      ? `${patients.find((p: any) => p.id === selectedResult.patientId).firstName} ${patients.find((p: any) => p.id === selectedResult.patientId).lastName}`
                      : `Patient #${selectedResult.patientId}`
                    }
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Date</h4>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selectedResult.resultDate, "PPP")}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-1">Test Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Test Name</p>
                    <p>{selectedResult.testName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Test Code</p>
                    <p>{selectedResult.testCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p>{getResultStatusBadge(selectedResult.status)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Source</p>
                    <p>{labSystems?.find((s: any) => s.id === selectedResult.labSystemId)?.name || 
                      `Lab #${selectedResult.labSystemId}`}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-1">Result</h4>
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold">
                      {formatResultValue(selectedResult)}
                    </span>
                    {selectedResult.status.toLowerCase() === "abnormal" && (
                      <Badge className="bg-yellow-500">Abnormal</Badge>
                    )}
                    {selectedResult.status.toLowerCase() === "critical" && (
                      <Badge className="bg-red-500">Critical</Badge>
                    )}
                  </div>
                  {selectedResult.referenceRange && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Reference Range: {selectedResult.referenceRange}
                    </p>
                  )}
                </div>
              </div>
              
              {selectedResult.notes && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Notes</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedResult.notes}</p>
                </div>
              )}
              
              {selectedResult.components && selectedResult.components.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Components</h4>
                  <Accordion type="single" collapsible className="w-full">
                    {selectedResult.components.map((component: any, index: number) => (
                      <AccordionItem key={index} value={`component-${index}`}>
                        <AccordionTrigger>
                          {component.name}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-2 py-2">
                            <div>
                              <p className="text-sm text-muted-foreground">Value</p>
                              <p>{component.value} {component.unit}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Reference Range</p>
                              <p>{component.referenceRange || "N/A"}</p>
                            </div>
                            {component.status && (
                              <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p>{getResultStatusBadge(component.status)}</p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
              
              {selectedResult.externalUrl && (
                <div className="flex justify-end">
                  <Button variant="outline" className="text-sm" asChild>
                    <a href={selectedResult.externalUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Original
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}