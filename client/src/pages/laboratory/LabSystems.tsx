import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw, Trash2, Edit, Loader2, Eye } from "lucide-react";
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
  CardFooter,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

import { LabSystemForm } from "./LabSystemForm";

export default function LabSystems() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddLabSystemOpen, setIsAddLabSystemOpen] = useState(false);
  const [isEditLabSystemOpen, setIsEditLabSystemOpen] = useState(false);
  const [selectedLabSystem, setSelectedLabSystem] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  // Fetch lab systems
  const {
    data: labSystems,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/lab-systems"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lab-systems");
      return response.json();
    },
  });

  // Delete lab system mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/lab-systems/${id}`),
    onSuccess: () => {
      toast({
        title: "Lab System Deleted",
        description: "The lab system has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lab-systems"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete the lab system. Please try again.",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("POST", `/api/lab-systems/${id}/test-connection`),
    onSuccess: (data) => {
      toast({
        title: "Connection Test",
        description: "Connection test completed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Test Failed",
        description: "Failed to connect to the lab system. Please check configuration.",
        variant: "destructive",
      });
      console.error("Connection test error:", error);
    },
  });

  // Sync now mutation
  const syncNowMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("POST", `/api/lab-systems/${id}/sync`),
    onSuccess: (data) => {
      toast({
        title: "Sync Started",
        description: "Lab system synchronization has been initiated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: "Failed to start synchronization. Please try again.",
        variant: "destructive",
      });
      console.error("Sync error:", error);
    },
  });

  // Filter lab systems by search term
  const filteredLabSystems = labSystems?.filter((labSystem: any) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      labSystem.name.toLowerCase().includes(searchLower) || 
      labSystem.type.toLowerCase().includes(searchLower) ||
      labSystem.url.toLowerCase().includes(searchLower)
    );
  });

  const handleOpenEdit = (labSystem: any) => {
    setSelectedLabSystem(labSystem);
    setIsEditLabSystemOpen(true);
  };

  const handleOpenDelete = (labSystem: any) => {
    setSelectedLabSystem(labSystem);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenDetails = (labSystem: any) => {
    setSelectedLabSystem(labSystem);
    setIsViewDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case "error":
        return <Badge className="bg-red-500">Error</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleFormSuccess = () => {
    setIsAddLabSystemOpen(false);
    setIsEditLabSystemOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/lab-systems"] });
  };

  const handleTestConnection = () => {
    if (!selectedLabSystem) return;
    testConnectionMutation.mutate(selectedLabSystem.id);
  };

  const handleSyncNow = () => {
    if (!selectedLabSystem) return;
    syncNowMutation.mutate(selectedLabSystem.id);
  };

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Laboratory Systems Integration</h1>
        <Dialog open={isAddLabSystemOpen} onOpenChange={setIsAddLabSystemOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Lab System
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Laboratory System</DialogTitle>
              <DialogDescription>
                Connect to an external laboratory information system.
              </DialogDescription>
            </DialogHeader>
            <LabSystemForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Laboratory Systems</CardTitle>
          <CardDescription>
            Manage connections to external laboratory information systems for test results
            integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search lab systems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Error loading lab systems. Please try again.
            </div>
          ) : filteredLabSystems?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No laboratory systems found. Add your first lab system to begin integration.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLabSystems?.map((labSystem: any) => (
                    <TableRow key={labSystem.id}>
                      <TableCell className="font-medium">{labSystem.name}</TableCell>
                      <TableCell>{labSystem.type}</TableCell>
                      <TableCell>
                        <span className="max-w-xs truncate block">{labSystem.url}</span>
                      </TableCell>
                      <TableCell>
                        {labSystem.lastSyncAt 
                          ? formatDate(labSystem.lastSyncAt, "PPp") 
                          : "Never"}
                      </TableCell>
                      <TableCell>{getStatusBadge(labSystem.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDetails(labSystem)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(labSystem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleOpenDelete(labSystem)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Lab System Dialog */}
      <Dialog open={isEditLabSystemOpen} onOpenChange={setIsEditLabSystemOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Laboratory System</DialogTitle>
            <DialogDescription>
              Update connection details for the laboratory system.
            </DialogDescription>
          </DialogHeader>
          <LabSystemForm labSystem={selectedLabSystem} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      {/* View Lab System Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Laboratory System Details</DialogTitle>
            <DialogDescription>
              View connection details and perform actions.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLabSystem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Name</Label>
                  <p className="mt-1">{selectedLabSystem.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Type</Label>
                  <p className="mt-1">{selectedLabSystem.type}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold">URL</Label>
                <p className="mt-1 break-all">{selectedLabSystem.url}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedLabSystem.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Last Sync</Label>
                  <p className="mt-1">
                    {selectedLabSystem.lastSyncAt 
                      ? formatDate(selectedLabSystem.lastSyncAt, "PPp") 
                      : "Never"}
                  </p>
                </div>
              </div>
              
              {selectedLabSystem.credentials && (
                <div>
                  <Label className="text-sm font-semibold">Authentication</Label>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    <div>
                      <Label className="text-xs text-muted-foreground">Username</Label>
                      <p className="text-sm">
                        {selectedLabSystem.credentials.username || "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">API Key</Label>
                      <p className="text-sm">
                        {selectedLabSystem.credentials.apiKey 
                          ? "••••••••••••" 
                          : "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedLabSystem.settings && (
                <div>
                  <Label className="text-sm font-semibold">Sync Settings</Label>
                  <div className="grid grid-cols-2 gap-4 mt-1">
                    <div>
                      <Label className="text-xs text-muted-foreground">Frequency</Label>
                      <p className="text-sm">
                        {selectedLabSystem.settings.syncFrequency || "Manual"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Data Retention</Label>
                      <p className="text-sm">
                        {selectedLabSystem.settings.retention || "Default"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4 justify-end mt-6">
                <Button variant="outline" onClick={handleTestConnection}>
                  Test Connection
                  {testConnectionMutation.isPending && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </Button>
                <Button onClick={handleSyncNow}>
                  Sync Now
                  {syncNowMutation.isPending && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lab System</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this laboratory system? This action cannot be undone
              and all sync history will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => selectedLabSystem && deleteMutation.mutate(selectedLabSystem.id)}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}