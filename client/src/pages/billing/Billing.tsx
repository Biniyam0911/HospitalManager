import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, MoreHorizontal, FileText, DollarSign, Receipt, CircleDollarSign } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";

const Billing = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  // Fetch bills
  const { data: bills, isLoading } = useQuery({
    queryKey: ["/api/bills"],
  });

  // Fetch patients for reference
  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
  });

  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: number, amount: number }) => {
      const bill = bills.find((b: any) => b.id === id);
      if (!bill) throw new Error("Bill not found");
      
      const newPaidAmount = bill.paidAmount + amount;
      return apiRequest("PATCH", `/api/bills/${id}`, {
        paidAmount: newPaidAmount,
        status: newPaidAmount >= bill.totalAmount ? "paid" : "partial"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      setPaymentDialogOpen(false);
      toast({
        title: "Success",
        description: "Payment processed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to process payment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter bills based on search
  const filteredBills = bills
    ? bills.filter((bill: any) => {
        // If we have patient data, search in patient name
        if (patients) {
          const patient = patients.find((p: any) => p.id === bill.patientId);
          if (patient) {
            const patientName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
            if (patientName.includes(searchTerm.toLowerCase())) {
              return true;
            }
          }
        }
        
        // Also search in bill ID and status
        return (
          bill.id.toString().includes(searchTerm) ||
          bill.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : [];

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Get patient name from patient ID
  const getPatientName = (patientId: number) => {
    if (!patients) return "Loading...";
    const patient = patients.find((p: any) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`;
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-secondary/10 text-secondary";
      case "pending":
        return "bg-alert/10 text-alert";
      case "partial":
        return "bg-primary/10 text-primary";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  // Handle payment form submission
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }
    
    processPaymentMutation.mutate({
      id: selectedBill.id,
      amount: amount
    });
  };

  // Calculate total outstanding amount
  const totalOutstanding = bills
    ? bills.reduce((sum: number, bill: any) => sum + (bill.totalAmount - bill.paidAmount), 0)
    : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-textDark">Billing</h1>
          <p className="text-midGrey">Manage patient invoices and payments</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => alert("Feature not implemented")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Billing Summary Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{bills?.length || 0}</div>
            <p className="text-midGrey text-sm mt-1">All invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Receipt className="h-4 w-4 mr-2 text-primary" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {bills?.filter((bill: any) => bill.status !== "paid").length || 0}
            </div>
            <p className="text-midGrey text-sm mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Outstanding Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-alert">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-midGrey text-sm mt-1">Total due</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Bills Table */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-borderColor">
        <div className="relative w-full md:w-72 mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-midGrey h-4 w-4" />
          <Input
            type="search"
            placeholder="Search bills..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4 text-midGrey">
                      {searchTerm ? "No bills found matching your search" : "No bills found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBills.map((bill: any) => (
                    <TableRow key={bill.id} className="hover:bg-neutral">
                      <TableCell className="font-medium">INV-{bill.id.toString().padStart(5, '0')}</TableCell>
                      <TableCell>{getPatientName(bill.patientId)}</TableCell>
                      <TableCell>{formatDate(new Date(bill.billDate), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        {bill.dueDate ? formatDate(new Date(bill.dueDate), "MMM dd, yyyy") : "N/A"}
                      </TableCell>
                      <TableCell>{formatCurrency(bill.totalAmount)}</TableCell>
                      <TableCell>{formatCurrency(bill.paidAmount)}</TableCell>
                      <TableCell className={bill.totalAmount > bill.paidAmount ? "text-alert font-medium" : ""}>
                        {formatCurrency(bill.totalAmount - bill.paidAmount)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(bill.status)}`}>
                          {bill.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => alert("Feature not implemented")}>
                              <FileText className="h-4 w-4 mr-2" />
                              <span>View Invoice</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedBill(bill);
                                setPaymentAmount("");
                                setPaymentDialogOpen(true);
                              }}
                              disabled={bill.status === "paid"}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span>Record Payment</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <form onSubmit={handleProcessPayment}>
              <div className="space-y-4 py-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-midGrey">Invoice #:</span>
                  <span className="font-medium">INV-{selectedBill.id.toString().padStart(5, '0')}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-midGrey">Patient:</span>
                  <span className="font-medium">{getPatientName(selectedBill.patientId)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-midGrey">Total Amount:</span>
                  <span className="font-medium">{formatCurrency(selectedBill.totalAmount)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-midGrey">Amount Paid:</span>
                  <span className="font-medium">{formatCurrency(selectedBill.paidAmount)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-midGrey">Balance Due:</span>
                  <span className="font-medium text-alert">{formatCurrency(selectedBill.totalAmount - selectedBill.paidAmount)}</span>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Amount ($)</label>
                  <div className="relative">
                    <CircleDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-midGrey h-4 w-4" />
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      max={selectedBill.totalAmount - selectedBill.paidAmount}
                      placeholder="Enter payment amount"
                      className="pl-10"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processPaymentMutation.isPending}>
                  {processPaymentMutation.isPending ? "Processing..." : "Process Payment"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;
