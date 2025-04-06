import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { ChevronDown, ChevronUp, CreditCard, Filter, Plus, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Bill {
  id: number;
  patientId: number;
  totalAmount: string;
  paidAmount: string;
  status: string;
  paymentMethod: string | null;
  billDate: string;
  dueDate: string | null;
  stripePaymentIntentId: string | null;
  stripePaymentStatus: string | null;
  createdAt: string;
}

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  patientId: string;
}

export default function Payments() {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Bill>('billDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Fetch all bills
  const { data: bills = [], isLoading: isLoadingBills } = useQuery({
    queryKey: ['/api/bills'],
    staleTime: 60000, // 1 minute
  });

  // Fetch all patients
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ['/api/patients'],
    staleTime: 300000, // 5 minutes
  });

  // Function to get patient name by ID
  const getPatientName = (patientId: number) => {
    const patient = patients.find((p: Patient) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`;
  };

  // Function to get patient ID number
  const getPatientIdNumber = (patientId: number) => {
    const patient = patients.find((p: Patient) => p.id === patientId);
    return patient ? patient.patientId : '';
  };

  // Sort and filter bills
  const sortedAndFilteredBills = [...bills]
    .filter((bill: Bill) => {
      // Filter by search text (patient name or bill ID)
      const patientName = getPatientName(bill.patientId).toLowerCase();
      const patientIdNumber = getPatientIdNumber(bill.patientId).toLowerCase();
      const searchMatch = 
        filter === '' || 
        patientName.includes(filter.toLowerCase()) || 
        patientIdNumber.includes(filter.toLowerCase()) ||
        bill.id.toString().includes(filter);
      
      // Filter by status
      const statusMatch = 
        statusFilter === 'all' || 
        (statusFilter === 'paid' && bill.status === 'Paid') ||
        (statusFilter === 'pending' && bill.status === 'Pending') ||
        (statusFilter === 'overdue' && bill.status === 'Overdue');
      
      return searchMatch && statusMatch;
    })
    .sort((a: Bill, b: Bill) => {
      if (sortField === 'totalAmount' || sortField === 'paidAmount') {
        const aValue = parseFloat(a[sortField] || '0');
        const bValue = parseFloat(b[sortField] || '0');
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        const aValue = a[sortField] || '';
        const bValue = b[sortField] || '';
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue.toString()) 
          : bValue.toString().localeCompare(aValue.toString());
      }
    });

  // Calculate pagination
  const totalPages = Math.ceil(sortedAndFilteredBills.length / itemsPerPage);
  const paginatedBills = sortedAndFilteredBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sorting
  const handleSort = (field: keyof Bill) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, statusFilter]);

  // Handle payment button click
  const handlePayNow = (bill: Bill) => {
    navigate(`/billing/checkout?billId=${bill.id}`);
  };

  // Payment status badge
  const PaymentStatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">Paid</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300">Pending</Badge>;
      case 'Overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-300">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Stripe payment status badge 
  const StripeStatusBadge = ({ status }: { status: string | null }) => {
    if (!status) return null;
    
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">Payment Succeeded</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300">Processing</Badge>;
      case 'requires_payment_method':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-300">Requires Payment</Badge>;
      case 'requires_confirmation':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-300">Requires Confirmation</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bill Payments</h1>
          <p className="text-gray-500 mt-1">Manage patient billing and payments</p>
        </div>
        <Button onClick={() => navigate('/billing/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Bill
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>Overview of payment statistics</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-blue-500 font-medium">Total Billed</p>
            <p className="text-2xl font-bold mt-1">
              ${bills.reduce((sum: number, bill: Bill) => sum + parseFloat(bill.totalAmount), 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{bills.length} bills issued</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-sm text-green-500 font-medium">Total Received</p>
            <p className="text-2xl font-bold mt-1">
              ${bills.reduce((sum: number, bill: Bill) => sum + parseFloat(bill.paidAmount || '0'), 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {bills.filter((bill: Bill) => bill.status === 'Paid').length} paid bills
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <p className="text-sm text-red-500 font-medium">Outstanding</p>
            <p className="text-2xl font-bold mt-1">
              ${bills
                .reduce(
                  (sum: number, bill: Bill) => 
                    sum + (parseFloat(bill.totalAmount) - parseFloat(bill.paidAmount || '0')), 
                  0
                )
                .toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {bills.filter((bill: Bill) => bill.status !== 'Paid').length} pending bills
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>View and manage all billing transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search by patient name or bill ID..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoadingBills || isLoadingPatients ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : paginatedBills.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No bills found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      onClick={() => handleSort('id')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        Bill #
                        {sortField === 'id' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead 
                      onClick={() => handleSort('billDate')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        Date
                        {sortField === 'billDate' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('totalAmount')}
                      className="cursor-pointer hover:bg-gray-50 text-right"
                    >
                      <div className="flex items-center justify-end">
                        Amount
                        {sortField === 'totalAmount' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('status')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        Status
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBills.map((bill: Bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getPatientName(bill.patientId)}</p>
                          <p className="text-sm text-gray-500">ID: {getPatientIdNumber(bill.patientId)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{new Date(bill.billDate).toLocaleDateString()}</p>
                          {bill.dueDate && (
                            <p className="text-sm text-gray-500">
                              Due: {new Date(bill.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">${parseFloat(bill.totalAmount).toFixed(2)}</p>
                          {bill.paidAmount && parseFloat(bill.paidAmount) > 0 && (
                            <p className="text-sm text-green-600">
                              Paid: ${parseFloat(bill.paidAmount).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <PaymentStatusBadge status={bill.status} />
                          {bill.stripePaymentStatus && (
                            <StripeStatusBadge status={bill.stripePaymentStatus} />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/billing/bills/${bill.id}`)}
                          >
                            View
                          </Button>
                          {bill.status !== 'Paid' && (
                            <Button 
                              size="sm"
                              onClick={() => handlePayNow(bill)}
                            >
                              <CreditCard className="mr-1 h-4 w-4" />
                              Pay
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pagination links for first, last, and around current page
                  let pageToShow: number | null = null;
                  
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all
                    pageToShow = i + 1;
                  } else if (currentPage <= 3) {
                    // If at the beginning, show first 5 pages
                    if (i < 4) {
                      pageToShow = i + 1;
                    } else {
                      pageToShow = totalPages;
                    }
                  } else if (currentPage >= totalPages - 2) {
                    // If at the end, show last 5 pages
                    if (i === 0) {
                      pageToShow = 1;
                    } else {
                      pageToShow = totalPages - 4 + i;
                    }
                  } else {
                    // Otherwise show current page and 2 pages on either side
                    if (i === 0) {
                      pageToShow = 1;
                    } else if (i === 4) {
                      pageToShow = totalPages;
                    } else {
                      pageToShow = currentPage - 1 + (i - 1);
                    }
                  }

                  // For middle cases with many pages, insert ellipsis
                  if (totalPages > 5) {
                    if ((i === 1 && pageToShow !== 2) || (i === 3 && pageToShow !== totalPages - 1)) {
                      return (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                  }

                  if (pageToShow !== null) {
                    return (
                      <PaginationItem key={pageToShow}>
                        <PaginationLink
                          isActive={currentPage === pageToShow}
                          onClick={() => setCurrentPage(pageToShow as number)}
                        >
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
}