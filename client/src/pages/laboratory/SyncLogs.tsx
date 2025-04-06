import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search, Clock, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
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
import { formatDate, formatDistanceToNow } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SyncLogs() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabSystem, setSelectedLabSystem] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isLogDetailsOpen, setIsLogDetailsOpen] = useState(false);

  // Number of logs to fetch
  const [limit, setLimit] = useState<number>(25);

  // Fetch lab systems for the filter dropdown
  const { data: labSystems } = useQuery({
    queryKey: ["/api/lab-systems"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/lab-systems");
      return response.json();
    },
  });

  // Fetch sync logs with filters
  const {
    data: syncLogs,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/lab-sync-logs", selectedLabSystem, limit],
    queryFn: async () => {
      let url = "/api/lab-sync-logs";
      const params = [];
      
      if (selectedLabSystem && selectedLabSystem !== "all") {
        params.push(`labSystemId=${selectedLabSystem}`);
      }
      
      params.push(`limit=${limit}`);
      
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      
      const response = await apiRequest("GET", url);
      return response.json();
    },
  });

  // Filter logs by search term
  const filteredLogs = syncLogs?.filter((log: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.status.toLowerCase().includes(searchLower) ||
      (log.notes && log.notes.toLowerCase().includes(searchLower))
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "scheduled":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "error":
        return "bg-red-500";
      case "scheduled":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDuration = (startedAt: string, completedAt: string | null) => {
    if (!completedAt) return "In progress";
    
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const durationMs = end.getTime() - start.getTime();
    
    if (durationMs < 1000) return `${durationMs}ms`;
    
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleViewLogDetails = (log: any) => {
    setSelectedLog(log);
    setIsLogDetailsOpen(true);
  };

  return (
    <div className="container mx-auto py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lab Synchronization Logs</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sync Logs</CardTitle>
          <CardDescription>
            View logs of synchronization activities with integrated laboratory systems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sync logs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                value={selectedLabSystem}
                onValueChange={setSelectedLabSystem}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by lab system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lab Systems</SelectItem>
                  {labSystems?.map((system: any) => (
                    <SelectItem key={system.id} value={system.id.toString()}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Number of logs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Last 10 logs</SelectItem>
                  <SelectItem value="25">Last 25 logs</SelectItem>
                  <SelectItem value="50">Last 50 logs</SelectItem>
                  <SelectItem value="100">Last 100 logs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                setSelectedLabSystem("");
                setSearchTerm("");
                setLimit(25);
                refetch();
              }}
              className="shrink-0"
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
              Error loading sync logs. Please try again.
            </div>
          ) : filteredLogs?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No synchronization logs found matching your criteria.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead>Lab System</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead className="text-right">Success/Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs?.map((log: any) => (
                    <TableRow 
                      key={log.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewLogDetails(log)}
                    >
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(log.status)}
                          <Badge className={`ml-2 ${getStatusColor(log.status)}`}>
                            {log.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {labSystems?.find((sys: any) => sys.id === log.labSystemId)?.name || 
                          `Lab System #${log.labSystemId}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDate(log.startedAt)}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.startedAt))} ago
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.completedAt ? (
                          <div className="flex flex-col">
                            <span>{formatDate(log.completedAt)}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(log.completedAt))} ago
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">In progress</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDuration(log.startedAt, log.completedAt)}
                      </TableCell>
                      <TableCell>{log.totalRecords || 0}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-500 font-medium mr-2">
                          {log.successCount || 0}
                        </span>
                        /
                        <span className="text-red-500 font-medium ml-2">
                          {log.errorCount || 0}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={isLogDetailsOpen} onOpenChange={setIsLogDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sync Log Details</DialogTitle>
            <DialogDescription>
              Details for synchronization log #{selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Status</h4>
                  <Badge className={getStatusColor(selectedLog.status)}>
                    {selectedLog.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Lab System</h4>
                  <p>
                    {labSystems?.find((sys: any) => sys.id === selectedLog.labSystemId)?.name || 
                      `Lab System #${selectedLog.labSystemId}`}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Started At</h4>
                  <p>{formatDate(selectedLog.startedAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Completed At</h4>
                  <p>{selectedLog.completedAt ? formatDate(selectedLog.completedAt) : "In progress"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Total Records</h4>
                  <p>{selectedLog.totalRecords || 0}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Success</h4>
                  <p className="text-green-500 font-medium">{selectedLog.successCount || 0}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Errors</h4>
                  <p className="text-red-500 font-medium">{selectedLog.errorCount || 0}</p>
                </div>
              </div>
              
              {selectedLog.notes && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Notes</h4>
                  <p className="text-sm">{selectedLog.notes}</p>
                </div>
              )}
              
              {selectedLog.errorDetails && (
                <div>
                  <h4 className="text-sm font-semibold mb-1 text-red-500">Error Details</h4>
                  <div className="bg-muted rounded-md p-2 max-h-32 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">
                      {typeof selectedLog.errorDetails === 'object' 
                        ? JSON.stringify(selectedLog.errorDetails, null, 2)
                        : selectedLog.errorDetails}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsLogDetailsOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}