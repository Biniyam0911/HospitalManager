import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  Clock, 
  Tag,
  History,
  ArrowRight
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Types based on the schema
interface Service {
  id: number;
  name: string;
  category: string;
  description: string | null;
  duration: number | null;
  status: string;
  requiresDoctor: boolean | null;
  requiresAppointment: boolean | null;
  taxable: boolean | null;
  createdAt: string;
  currentPrice?: {
    id: number;
    serviceId: number;
    price: string;
    effectiveDate: string;
    year: number;
    expiryDate: string | null;
  };
}

interface ServiceFormData {
  name: string;
  category: string;
  description: string | null;
  duration: number | null;
  status: string;
  requiresDoctor: boolean | null;
  requiresAppointment: boolean | null;
  taxable: boolean | null;
  price?: string;
  effectiveDate?: string;
  year?: number;
}

export default function Services() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Service>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [newService, setNewService] = useState<ServiceFormData>({
    name: '',
    category: 'consultation',
    description: '',
    duration: 30,
    status: 'active',
    requiresDoctor: false,
    requiresAppointment: false,
    taxable: true,
    price: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    year: new Date().getFullYear()
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [editedService, setEditedService] = useState<ServiceFormData | null>(null);
  
  // Pagination config
  const itemsPerPage = 10;
  
  // Fetch services
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['/api/services'],
  });
  
  // Categories derived from the actual data
  const categories = Array.from(
    new Set(services.map((service: Service) => service.category))
  );
  
  // Filter and sort services
  const filteredServices = services.filter((service: Service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const sortedServices = [...filteredServices].sort((a: Service, b: Service) => {
    let valueA: any = a[sortField];
    let valueB: any = b[sortField];
    
    if (sortField === 'currentPrice') {
      valueA = a.currentPrice?.price || '0';
      valueB = b.currentPrice?.price || '0';
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }
    }
    
    if (valueA === null) valueA = '';
    if (valueB === null) valueB = '';
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
    
    return sortDirection === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
  });
  
  // Pagination
  const totalPages = Math.ceil(sortedServices.length / itemsPerPage);
  const paginatedServices = sortedServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle sorting
  const handleSort = (field: keyof Service) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handlers for CRUD operations
  const handleAddService = async () => {
    try {
      const response = await apiRequest('POST', '/api/services', newService);
      const data = await response.json();
      
      // Invalidate query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      toast({
        title: 'Service Added',
        description: `${newService.name} has been added successfully.`,
      });
      
      // Reset form and close dialog
      setNewService({
        name: '',
        category: 'consultation',
        description: '',
        duration: 30,
        status: 'active',
        requiresDoctor: false,
        requiresAppointment: false,
        taxable: true,
        price: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        year: new Date().getFullYear()
      });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add service. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleEditService = async () => {
    if (!serviceToEdit || !editedService) return;
    
    try {
      const response = await apiRequest('PATCH', `/api/services/${serviceToEdit.id}`, editedService);
      const data = await response.json();
      
      // Invalidate query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      toast({
        title: 'Service Updated',
        description: `${editedService.name} has been updated successfully.`,
      });
      
      // Reset form and close dialog
      setServiceToEdit(null);
      setEditedService(null);
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update service. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    
    try {
      // Instead of deleting, we change the status to inactive
      const response = await apiRequest('PATCH', `/api/services/${serviceToDelete.id}`, {
        status: 'inactive'
      });
      const data = await response.json();
      
      // Invalidate query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      
      toast({
        title: 'Service Deactivated',
        description: `${serviceToDelete.name} has been deactivated successfully.`,
      });
      
      // Reset and close dialog
      setServiceToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate service. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const openEditDialog = (service: Service) => {
    setServiceToEdit(service);
    setEditedService({
      name: service.name,
      category: service.category,
      description: service.description,
      duration: service.duration,
      status: service.status,
      requiresDoctor: service.requiresDoctor,
      requiresAppointment: service.requiresAppointment,
      taxable: service.taxable,
      price: service.currentPrice?.price,
      effectiveDate: service.currentPrice?.effectiveDate 
        ? new Date(service.currentPrice.effectiveDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      year: service.currentPrice?.year || new Date().getFullYear()
    });
    setIsEditDialogOpen(true);
  };
  
  const confirmDelete = (service: Service) => {
    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };
  
  // Template for rendering service status badge
  const StatusBadge = ({ status }: { status: string }) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-300">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-500 mt-1">Manage medical services and their pricing</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Service
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Service Overview</CardTitle>
          <CardDescription>Managing {filteredServices.length} services across {categories.length} categories</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-blue-500 font-medium">Total Services</p>
            <p className="text-2xl font-bold mt-1">{services.length}</p>
            <p className="text-xs text-gray-500 mt-1">Across all categories</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-sm text-green-500 font-medium">Active Services</p>
            <p className="text-2xl font-bold mt-1">
              {services.filter((s: Service) => s.status === 'active').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Currently available</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <p className="text-sm text-orange-500 font-medium">Categories</p>
            <p className="text-2xl font-bold mt-1">{categories.length}</p>
            <p className="text-xs text-gray-500 mt-1">Different service types</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Service Catalog</CardTitle>
          <CardDescription>Browse, search and manage all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search services by name or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select 
                value={categoryFilter} 
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : paginatedServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No services found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      onClick={() => handleSort('name')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        Name
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('category')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        Category
                        {sortField === 'category' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('currentPrice')}
                      className="cursor-pointer hover:bg-gray-50 text-right"
                    >
                      <div className="flex items-center justify-end">
                        Price
                        {sortField === 'currentPrice' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('duration')}
                      className="cursor-pointer hover:bg-gray-50 text-right"
                    >
                      <div className="flex items-center justify-end">
                        Duration
                        {sortField === 'duration' && (
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
                  {paginatedServices.map((service: Service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{service.name}</p>
                          {service.description && (
                            <p className="text-sm text-gray-500 truncate max-w-[250px]">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-300">
                          {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {service.currentPrice ? (
                          <div>
                            <p className="font-medium">${parseFloat(service.currentPrice.price).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">
                              Year: {service.currentPrice.year}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {service.duration ? (
                          <div className="flex items-center justify-end">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{service.duration} min</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={service.status} />
                        <div className="mt-1 flex space-x-1 text-xs">
                          {service.requiresDoctor && (
                            <Badge variant="outline" className="text-xs">Requires Doctor</Badge>
                          )}
                          {service.requiresAppointment && (
                            <Badge variant="outline" className="text-xs">Needs Appointment</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/services/price-history/${service.id}`)}
                            title="View Price History"
                            className="text-blue-500 border-blue-200 hover:bg-blue-50"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {service.status === 'active' && (
                            <Button 
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-200 hover:bg-red-50"
                              onClick={() => confirmDelete(service)}
                            >
                              <Trash2 className="h-4 w-4" />
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  // Show first, last, and pages around current page
                  if (
                    i === 0 || 
                    i === totalPages - 1 || 
                    (i >= currentPage - 2 && i <= currentPage + 2)
                  ) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  // Add ellipsis
                  if (i === 1 && currentPage > 4) {
                    return <PaginationEllipsis key="ellipsis-start" />;
                  }
                  if (i === totalPages - 2 && currentPage < totalPages - 3) {
                    return <PaginationEllipsis key="ellipsis-end" />;
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
      
      {/* Add Service Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new service with details and pricing information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Service Name
              </label>
              <Input
                id="name"
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
                placeholder="e.g., General Consultation"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Select
                  value={newService.category}
                  onValueChange={(value) => setNewService({...newService, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="procedure">Procedure</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="laboratory">Laboratory</SelectItem>
                    <SelectItem value="radiology">Radiology</SelectItem>
                    <SelectItem value="therapy">Therapy</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={newService.status}
                  onValueChange={(value) => setNewService({...newService, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                value={newService.description || ''}
                onChange={(e) => setNewService({...newService, description: e.target.value})}
                placeholder="Brief description of the service"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="duration" className="text-sm font-medium">
                  Duration (minutes)
                </label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={newService.duration || ''}
                  onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value) || null})}
                  placeholder="e.g., 30"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Price ($)
                </label>
                <Input
                  id="price"
                  type="text"
                  value={newService.price || ''}
                  onChange={(e) => setNewService({...newService, price: e.target.value})}
                  placeholder="e.g., 150.00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="effectiveDate" className="text-sm font-medium">
                  Price Effective Date
                </label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={newService.effectiveDate}
                  onChange={(e) => setNewService({...newService, effectiveDate: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="year" className="text-sm font-medium">
                  Year
                </label>
                <Input
                  id="year"
                  type="number"
                  min="2023"
                  max="2030"
                  value={newService.year || new Date().getFullYear()}
                  onChange={(e) => setNewService({...newService, year: parseInt(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresDoctor"
                  checked={newService.requiresDoctor || false}
                  onChange={(e) => setNewService({...newService, requiresDoctor: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="requiresDoctor" className="text-sm">
                  Requires Doctor
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requiresAppointment"
                  checked={newService.requiresAppointment || false}
                  onChange={(e) => setNewService({...newService, requiresAppointment: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="requiresAppointment" className="text-sm">
                  Needs Appointment
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="taxable"
                  checked={newService.taxable || false}
                  onChange={(e) => setNewService({...newService, taxable: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="taxable" className="text-sm">
                  Taxable
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddService}
              disabled={!newService.name || !newService.category || !newService.price}
            >
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service details and pricing information
            </DialogDescription>
          </DialogHeader>
          
          {editedService && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Service Name
                </label>
                <Input
                  id="edit-name"
                  value={editedService.name}
                  onChange={(e) => setEditedService({...editedService, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-category" className="text-sm font-medium">
                    Category
                  </label>
                  <Select
                    value={editedService.category}
                    onValueChange={(value) => setEditedService({...editedService, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="laboratory">Laboratory</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="therapy">Therapy</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="edit-status" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    value={editedService.status}
                    onValueChange={(value) => setEditedService({...editedService, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="edit-description" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="edit-description"
                  value={editedService.description || ''}
                  onChange={(e) => setEditedService({...editedService, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-duration" className="text-sm font-medium">
                    Duration (minutes)
                  </label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="0"
                    value={editedService.duration || ''}
                    onChange={(e) => setEditedService({...editedService, duration: parseInt(e.target.value) || null})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="edit-price" className="text-sm font-medium">
                    Price ($)
                  </label>
                  <Input
                    id="edit-price"
                    type="text"
                    value={editedService.price || ''}
                    onChange={(e) => setEditedService({...editedService, price: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-effectiveDate" className="text-sm font-medium">
                    Price Effective Date
                  </label>
                  <Input
                    id="edit-effectiveDate"
                    type="date"
                    value={editedService.effectiveDate}
                    onChange={(e) => setEditedService({...editedService, effectiveDate: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="edit-year" className="text-sm font-medium">
                    Year
                  </label>
                  <Input
                    id="edit-year"
                    type="number"
                    min="2023"
                    max="2030"
                    value={editedService.year || new Date().getFullYear()}
                    onChange={(e) => setEditedService({...editedService, year: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-requiresDoctor"
                    checked={editedService.requiresDoctor || false}
                    onChange={(e) => setEditedService({...editedService, requiresDoctor: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="edit-requiresDoctor" className="text-sm">
                    Requires Doctor
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-requiresAppointment"
                    checked={editedService.requiresAppointment || false}
                    onChange={(e) => setEditedService({...editedService, requiresAppointment: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="edit-requiresAppointment" className="text-sm">
                    Needs Appointment
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-taxable"
                    checked={editedService.taxable || false}
                    onChange={(e) => setEditedService({...editedService, taxable: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="edit-taxable" className="text-sm">
                    Taxable
                  </label>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setServiceToEdit(null);
              setEditedService(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditService}
              disabled={!editedService?.name || !editedService?.category}
            >
              Update Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Deactivate Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this service? It will no longer be available for use.
            </DialogDescription>
          </DialogHeader>
          
          {serviceToDelete && (
            <div className="py-4">
              <p className="font-medium text-gray-900">{serviceToDelete.name}</p>
              <p className="text-sm text-gray-500 mt-1">{serviceToDelete.description}</p>
              <div className="mt-4 flex items-center">
                <Tag className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {serviceToDelete.category.charAt(0).toUpperCase() + serviceToDelete.category.slice(1)}
                </span>
              </div>
              {serviceToDelete.currentPrice && (
                <div className="mt-2 flex items-center">
                  <span className="text-sm text-gray-500">
                    Current price: ${parseFloat(serviceToDelete.currentPrice.price).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteDialogOpen(false);
              setServiceToDelete(null);
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteService}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}