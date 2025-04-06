import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon, ClipboardIcon, FileEditIcon, PackageCheckIcon, BanIcon, ReceiptIcon, AlertCircleIcon, RefreshCwIcon, PrinterIcon, ExternalLinkIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

// Service order form schema
const serviceOrderSchema = z.object({
  patientId: z.number({
    required_error: "Patient is required",
  }),
  doctorId: z.number().nullable(),
  notes: z.string().nullable(),
  status: z.string().default("pending"),
});

// Service order item form schema
const serviceOrderItemSchema = z.object({
  serviceId: z.number({
    required_error: "Service is required",
  }),
  servicePriceVersionId: z.number({
    required_error: "Service price version is required",
  }),
  quantity: z.number().min(1, {
    message: "Quantity must be at least 1",
  }).default(1),
  unitPrice: z.string(),
  totalPrice: z.string(),
  notes: z.string().nullable(),
  status: z.string().default("pending"),
});

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const color = statusColors[status as keyof typeof statusColors] || statusColors.pending;

  return (
    <Badge variant="outline" className={`${color} border`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function ServiceOrders() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for creating a new service order
  const orderForm = useForm<z.infer<typeof serviceOrderSchema>>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      notes: "",
      status: "pending",
    },
  });

  // Form for adding a service item to an order
  const itemForm = useForm<z.infer<typeof serviceOrderItemSchema>>({
    resolver: zodResolver(serviceOrderItemSchema),
    defaultValues: {
      quantity: 1,
      notes: "",
      status: "pending",
      unitPrice: "0.00",
      totalPrice: "0.00",
    },
  });

  // Fetch all service orders
  const { data: orders, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['/api/service-orders'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/service-orders");
      return response.json();
    },
  });
  
  // Fetch admissions to identify inpatient vs outpatient
  const { data: admissions } = useQuery({
    queryKey: ['/api/admissions'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admissions");
      return response.json();
    },
  });

  // Fetch patients for the dropdown
  const { data: patients } = useQuery({
    queryKey: ['/api/patients'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/patients");
      return response.json();
    },
  });

  // Fetch doctors for the dropdown
  const { data: doctors } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      const allUsers = await response.json();
      return allUsers.filter((user: any) => user.role === 'doctor');
    },
  });

  // Fetch services for the service dropdown
  const { data: services } = useQuery({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/services");
      return response.json();
    },
  });

  // Fetch service order items for a specific order
  const { data: orderItems, isLoading: isItemsLoading, refetch: refetchItems } = useQuery({
    queryKey: ['/api/service-order-items', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder) return [];
      const response = await apiRequest("GET", `/api/service-order-items/order/${selectedOrder.id}`);
      return response.json();
    },
    enabled: !!selectedOrder,
  });

  // Create a new service order
  const createOrderMutation = useMutation({
    mutationFn: async (data: z.infer<typeof serviceOrderSchema>) => {
      const response = await apiRequest("POST", "/api/service-orders", data);
      const order = await response.json();
      return order;
    },
    onSuccess: (data) => {
      toast({
        title: "Service Order Created",
        description: `Order #${data.id} has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-orders'] });
      setIsCreateDialogOpen(false);
      orderForm.reset();
      setSelectedOrder(data);
      setOrderDetailsOpen(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create service order.",
        variant: "destructive",
      });
    },
  });

  // Add an item to a service order
  const addItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof serviceOrderItemSchema>) => {
      const response = await apiRequest("POST", "/api/service-order-items", {
        ...data,
        serviceOrderId: selectedOrder.id,
      });
      const item = await response.json();
      return item;
    },
    onSuccess: () => {
      toast({
        title: "Service Added",
        description: "Service has been added to the order successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-order-items', selectedOrder?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/service-orders'] });
      setIsItemDialogOpen(false);
      itemForm.reset({
        quantity: 1,
        notes: "",
        status: "pending",
        unitPrice: "0.00",
        totalPrice: "0.00",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add service to order.",
        variant: "destructive",
      });
    },
  });

  // Update service order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/service-orders/${id}`, { status });
      const order = await response.json();
      return order;
    },
    onSuccess: (data) => {
      toast({
        title: "Status Updated",
        description: `Order status is now ${data.status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-orders'] });
      if (selectedOrder?.id === data.id) {
        setSelectedOrder(data);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  // Handler for selecting a service in the dropdown
  const handleServiceSelect = async (serviceId: string) => {
    const service = services?.find((s: any) => s.id === parseInt(serviceId));
    setSelectedService(service);
    
    if (service) {
      try {
        // Fetch the current price for this service
        const response = await apiRequest("GET", `/api/service-price-versions/current/${service.id}`);
        const currentPrice = await response.json();
        
        if (currentPrice) {
          itemForm.setValue("servicePriceVersionId", currentPrice.id);
          itemForm.setValue("unitPrice", currentPrice.price);
          
          // Calculate total price based on quantity
          const quantity = itemForm.getValues("quantity");
          const total = (parseFloat(currentPrice.price) * quantity).toFixed(2);
          itemForm.setValue("totalPrice", total);
        }
      } catch (error) {
        console.error("Error fetching current price:", error);
        toast({
          title: "Price Unavailable",
          description: "Could not fetch the current price for this service.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle quantity change to recalculate total price
  const handleQuantityChange = (quantity: number) => {
    const unitPrice = parseFloat(itemForm.getValues("unitPrice") || "0");
    const totalPrice = (unitPrice * quantity).toFixed(2);
    itemForm.setValue("totalPrice", totalPrice);
  };

  // Filter orders based on selected tab
  const filteredOrders = orders ? orders.filter((order: any) => {
    if (selectedTab === "all") return true;
    return order.status === selectedTab;
  }) : [];

  // Submit handler for creating a new service order
  const onSubmitOrder = (data: z.infer<typeof serviceOrderSchema>) => {
    createOrderMutation.mutate(data);
  };

  // Submit handler for adding a service to an order
  const onSubmitItem = (data: z.infer<typeof serviceOrderItemSchema>) => {
    addItemMutation.mutate(data);
  };

  // Helper to get patient name by ID
  const getPatientName = (patientId: number) => {
    const patient = patients?.find((p: any) => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`;
  };

  // Helper to get doctor name by ID
  const getDoctorName = (doctorId: number) => {
    const doctor = doctors?.find((d: any) => d.id === doctorId);
    return doctor ? doctor.name : `Doctor #${doctorId}`;
  };

  // Helper to get service name by ID
  const getServiceName = (serviceId: number) => {
    const service = services?.find((s: any) => s.id === serviceId);
    return service ? service.name : `Service #${serviceId}`;
  };
  
  // Helper to determine if patient is inpatient or outpatient
  const getPatientType = (patientId: number, orderDate: string) => {
    if (!admissions || !orderDate) return "Outpatient";
    
    // Convert orderDate to Date object for comparison
    const orderDateObj = new Date(orderDate);
    
    // Check if patient had any active admission during the order date
    const activeAdmission = admissions.find((admission: any) => {
      return admission.patientId === patientId && 
             new Date(admission.admissionDate) <= orderDateObj && 
             (!admission.dischargeDate || new Date(admission.dischargeDate) >= orderDateObj) &&
             admission.status !== "cancelled";
    });
    
    return activeAdmission ? "Inpatient" : "Outpatient";
  };
  
  // Function to handle printing an invoice
  const printInvoice = (order: any) => {
    // Create a new window for the invoice
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow pop-ups to print invoices",
        variant: "destructive",
      });
      return;
    }
    
    // Get patient info and items for the invoice
    const patientInfo = patients.find((p: any) => p.id === order.patientId);
    const patientName = patientInfo ? `${patientInfo.firstName} ${patientInfo.lastName}` : 'Unknown Patient';
    const patientType = getPatientType(order.patientId, order.orderDate);
    
    // Get total amount
    const total = parseFloat(order.totalAmount).toFixed(2);
    
    // Get order items from the API
    apiRequest("GET", `/api/service-order-items/order/${order.id}`)
      .then(res => res.json())
      .then(orderItemsData => {
        generateInvoice(order, orderItemsData, patientInfo, patientName, patientType, total, printWindow);
      })
      .catch(() => {
        // If order items failed to load, generate with empty array
        generateInvoice(order, [], patientInfo, patientName, patientType, total, printWindow);
      });
  };
  
  // Helper function to generate the invoice HTML and show it in the print window
  const generateInvoice = (order: any, orderItemsData: any[], patientInfo: any, patientName: string, patientType: string, total: string, printWindow: Window) => {
    
    // Generate the invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #2196F3;
            padding-bottom: 10px;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .invoice-details > div {
            flex: 1;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .amount {
            text-align: right;
          }
          .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .patient-type {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
          }
          .inpatient {
            background-color: #e3f2fd;
            color: #0d47a1;
          }
          .outpatient {
            background-color: #e8f5e9;
            color: #1b5e20;
          }
          @media print {
            .no-print {
              display: none;
            }
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h1>Hospital Invoice</h1>
          <h2>Service Order #${order.id}</h2>
          <div class="patient-type ${getPatientType(order.patientId, order.orderDate).toLowerCase()}">
            ${getPatientType(order.patientId, order.orderDate)}
          </div>
        </div>
        
        <div class="invoice-details">
          <div>
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${patientName}</p>
            <p><strong>ID:</strong> ${patientInfo && patientInfo.patientId ? patientInfo.patientId : 'N/A'}</p>
            <p><strong>Date:</strong> ${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <h3>Order Information</h3>
            <p><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
            <p><strong>Doctor:</strong> ${order.doctorId ? getDoctorName(order.doctorId) : 'N/A'}</p>
            <p><strong>Created By:</strong> ${order.createdBy ? 'Staff #' + order.createdBy : 'System'}</p>
          </div>
        </div>
        
        <h3>Ordered Services</h3>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th class="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsData.map((item: any) => `
              <tr>
                <td>${getServiceName(item.serviceId)}</td>
                <td>${item.quantity}</td>
                <td>$${parseFloat(item.unitPrice).toFixed(2)}</td>
                <td class="amount">$${parseFloat(item.totalPrice).toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3" class="amount">Total:</td>
              <td class="amount">$${total}</td>
            </tr>
          </tbody>
        </table>
        
        ${order.notes ? `
        <div>
          <h3>Notes</h3>
          <p>${order.notes}</p>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Thank you for choosing our hospital. For any questions, please contact billing department.</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print();" style="padding: 10px 20px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Print Invoice
          </button>
          <button onclick="window.close();" style="padding: 10px 20px; margin-left: 10px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">
            Close
          </button>
        </div>
      </body>
      </html>
    `;
    
    // Write the HTML to the new window and trigger print
    printWindow.document.open();
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Orders</h1>
          <p className="text-muted-foreground">Manage patient service orders and process services</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Service Order</DialogTitle>
              <DialogDescription>
                Create a new service order for a patient
              </DialogDescription>
            </DialogHeader>
            <Form {...orderForm}>
              <form onSubmit={orderForm.handleSubmit(onSubmitOrder)} className="space-y-6">
                <FormField
                  control={orderForm.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients?.map((patient: any) => (
                            <SelectItem key={patient.id} value={patient.id.toString()}>
                              {patient.firstName} {patient.lastName} ({patient.patientId})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={orderForm.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select doctor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {doctors?.map((doctor: any) => (
                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                              {doctor.name} ({doctor.specialty || "General"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a doctor if this service requires one
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={orderForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add any notes about this order" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createOrderMutation.isPending}>
                    {createOrderMutation.isPending ? "Creating..." : "Create Order"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {isOrdersLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No service orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{getPatientName(order.patientId)}</TableCell>
                          <TableCell>
                            <Badge variant={getPatientType(order.patientId, order.orderDate) === "Inpatient" ? "secondary" : "outline"}>
                              {getPatientType(order.patientId, order.orderDate)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(order.orderDate)}</TableCell>
                          <TableCell>
                            <StatusBadge status={order.status} />
                          </TableCell>
                          <TableCell className="font-semibold">${parseFloat(order.totalAmount).toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setOrderDetailsOpen(true);
                                }}
                              >
                                <ClipboardIcon className="h-4 w-4" />
                                <span className="sr-only">View</span>
                              </Button>
                              {order.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: "completed" })}
                                >
                                  <PackageCheckIcon className="h-4 w-4 text-green-500" />
                                  <span className="sr-only">Complete</span>
                                </Button>
                              )}
                              {order.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: "cancelled" })}
                                >
                                  <BanIcon className="h-4 w-4 text-red-500" />
                                  <span className="sr-only">Cancel</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Service Order Details Sheet */}
      <Sheet open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <SheetContent className="w-[400px] sm:w-[600px] md:w-[750px]">
          <SheetHeader>
            <SheetTitle>Service Order #{selectedOrder?.id}</SheetTitle>
            <SheetDescription>
              Order details and services
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {selectedOrder && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Patient</h3>
                    <p className="mt-1">{getPatientName(selectedOrder.patientId)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Patient Type</h3>
                    <div className="mt-1">
                      <Badge variant={getPatientType(selectedOrder.patientId, selectedOrder.orderDate) === "Inpatient" ? "secondary" : "outline"}>
                        {getPatientType(selectedOrder.patientId, selectedOrder.orderDate)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-1">
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Order Date</h3>
                    <p className="mt-1">{formatDate(selectedOrder.orderDate.toString())}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Doctor</h3>
                    <p className="mt-1">{selectedOrder.doctorId ? getDoctorName(selectedOrder.doctorId) : "N/A"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p className="mt-1">{selectedOrder.notes || "No notes"}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Services</h3>
                    {selectedOrder.status === "pending" && (
                      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Service
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Add Service</DialogTitle>
                            <DialogDescription>
                              Add a service to this order
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...itemForm}>
                            <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-6">
                              <FormField
                                control={itemForm.control}
                                name="serviceId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Service</FormLabel>
                                    <Select 
                                      onValueChange={(value) => {
                                        field.onChange(parseInt(value));
                                        handleServiceSelect(value);
                                      }}
                                      defaultValue={field.value?.toString()}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select service" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {services?.map((service: any) => (
                                          <SelectItem key={service.id} value={service.id.toString()}>
                                            {service.name} ({service.category})
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={itemForm.control}
                                name="quantity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min={1} 
                                        {...field} 
                                        value={field.value}
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value);
                                          field.onChange(value);
                                          handleQuantityChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={itemForm.control}
                                  name="unitPrice"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Unit Price</FormLabel>
                                      <FormControl>
                                        <Input {...field} readOnly />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={itemForm.control}
                                  name="totalPrice"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Total Price</FormLabel>
                                      <FormControl>
                                        <Input {...field} readOnly />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={itemForm.control}
                                name="notes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder="Add any notes for this service" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <input type="hidden" {...itemForm.register("servicePriceVersionId")} />
                              <DialogFooter>
                                <Button type="submit" disabled={addItemMutation.isPending}>
                                  {addItemMutation.isPending ? "Adding..." : "Add Service"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {isItemsLoading ? (
                    <div className="flex justify-center p-6">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : orderItems?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems?.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell>{getServiceName(item.serviceId)}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${parseFloat(item.unitPrice).toFixed(2)}</TableCell>
                            <TableCell>${parseFloat(item.totalPrice).toFixed(2)}</TableCell>
                            <TableCell>
                              <StatusBadge status={item.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="text-right font-semibold pr-4 py-4">Total:</td>
                          <td className="font-semibold py-4">${parseFloat(selectedOrder.totalAmount).toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircleIcon className="mx-auto h-10 w-10 mb-2 opacity-50" />
                      <p>No services have been added to this order yet.</p>
                      {selectedOrder.status === "pending" && (
                        <Button variant="outline" className="mt-4" onClick={() => setIsItemDialogOpen(true)}>
                          <PlusIcon className="mr-2 h-4 w-4" />
                          Add First Service
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-end space-x-4">
                  {selectedOrder.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => updateOrderStatusMutation.mutate({ id: selectedOrder.id, status: "cancelled" })}
                        disabled={updateOrderStatusMutation.isPending}
                      >
                        <BanIcon className="mr-2 h-4 w-4" />
                        Cancel Order
                      </Button>
                      <Button
                        onClick={() => updateOrderStatusMutation.mutate({ id: selectedOrder.id, status: "completed" })}
                        disabled={updateOrderStatusMutation.isPending}
                      >
                        <PackageCheckIcon className="mr-2 h-4 w-4" />
                        Complete Order
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === "completed" && (
                    <Button variant="outline" onClick={() => printInvoice(selectedOrder)}>
                      <ReceiptIcon className="mr-2 h-4 w-4" />
                      Print Invoice
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      refetchItems();
                      queryClient.invalidateQueries({ queryKey: ['/api/service-orders'] });
                    }}
                  >
                    <RefreshCwIcon className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}