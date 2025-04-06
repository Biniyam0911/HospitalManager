import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, DollarSign, Clock } from 'lucide-react';

// Types
interface PriceVersion {
  id: number;
  serviceId: number;
  price: string;
  effectiveDate: string;
  year: number;
  expiryDate: string | null;
  createdAt: string;
  notes: string | null;
  createdBy: number;
}

interface Service {
  id: number;
  name: string;
  category: string;
  status: string;
}

export default function PriceHistory() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [, navigate] = useLocation();
  
  // Fetch service data
  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: [`/api/services/${serviceId}`],
  });
  
  // Fetch price history
  const { data: priceHistory = [], isLoading: priceHistoryLoading } = useQuery({
    queryKey: [`/api/service-prices/${serviceId}`],
    retry: 1,
  });
  
  // Status badge
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-300">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Price status badge based on expiryDate
  const PriceStatusBadge = ({ version }: { version: PriceVersion }) => {
    const today = new Date();
    const effectiveDate = new Date(version.effectiveDate);
    const expiryDate = version.expiryDate ? new Date(version.expiryDate) : null;
    
    if (effectiveDate > today) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300">Future</Badge>;
    }
    
    if (!expiryDate || expiryDate >= today) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">Current</Badge>;
    }
    
    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-300">Expired</Badge>;
  };
  
  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const isLoading = serviceLoading || priceHistoryLoading;
  
  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/services')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Services
      </Button>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{service?.name}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {service?.category}
                </Badge>
                <StatusBadge status={service?.status} />
              </div>
            </div>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>
                View all historical price changes for this service
              </CardDescription>
            </CardHeader>
            <CardContent>
              {priceHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No price history found for this service</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {priceHistory.map((version: PriceVersion) => (
                      <TableRow key={version.id}>
                        <TableCell>
                          <PriceStatusBadge version={version} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                            <span className="font-medium">
                              {parseFloat(version.price).toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{version.year}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-blue-600 mr-1" />
                            {formatDate(version.effectiveDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {version.expiryDate ? (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-red-600 mr-1" />
                              {formatDate(version.expiryDate)}
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {version.notes || <span className="text-gray-500">-</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}