import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertMedicalRecordSchema, insertMedicalOrderSchema } from "@shared/schema.pg";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import PrintPrescription from "@/components/PrintPrescription";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Create a form schema based on insertMedicalRecordSchema 
const formSchema = insertMedicalRecordSchema.extend({
  subjective: z.string().min(1, "Chief complaint is required"),
  objective: z.string().min(1, "Clinical findings are required"),
  assessment: z.string().min(1, "Diagnosis is required"),
  plan: z.string().min(1, "Treatment plan is required"),
});

// Create a form schema for medical orders
const orderFormSchema = insertMedicalOrderSchema.extend({
  name: z.string().min(1, "Order name is required"),
  orderType: z.enum(["medication", "lab", "imaging", "procedure"], {
    required_error: "Please select an order type",
  }),
  orderDate: z.coerce.date(),
  startDate: z.coerce.date(),
  priority: z.enum(["stat", "urgent", "routine"], {
    required_error: "Please select a priority level",
  }),
  instructions: z.string().min(1, "Instructions are required"),
  dosage: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type OrderFormValues = z.infer<typeof orderFormSchema>;

const PatientEMR = ({ id }: { id: string }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("records");

  // Fetch patient data
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: [`/api/patients/${id}`],
  });

  // Fetch medical records for this patient
  const { data: medicalRecords = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ["/api/medical-records/patient", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/medical-records/patient/${id}`);
      return res.json();
    },
  });

  // Fetch the user/doctor data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/session"],
  });

  // Fetch medical orders for this patient
  const { data: medicalOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["/api/medical-orders/patient", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/medical-orders/patient/${id}`);
      return res.json();
    },
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: parseInt(id),
      doctorId: user?.id || 1, // Default to the first doctor if none is logged in
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
    },
  });

  // Create medical record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/medical-records", data);
      if (!response.ok) {
        throw new Error("Failed to create medical record");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records/patient", id] });
      toast({
        title: "Medical record created",
        description: "The patient's medical record was successfully saved.",
        variant: "default",
      });
      form.reset();
      setActiveTab("records");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create medical record. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createRecordMutation.mutate(data);
  };

  // Order form setup
  const orderForm = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      patientId: parseInt(id),
      doctorId: user?.id || 1, // Default to the first doctor if none is logged in
      name: "",
      orderType: "medication",
      orderDate: new Date(),
      startDate: new Date(),
      priority: "routine",
      status: "ordered",
      instructions: "",
      dosage: "",
      route: "",
      frequency: "",
    },
  });

  // Create medical order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      const response = await apiRequest("POST", "/api/medical-orders", data);
      if (!response.ok) {
        throw new Error("Failed to create medical order");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-orders/patient", id] });
      toast({
        title: "Medical order created",
        description: "The patient's medical order was successfully saved.",
        variant: "default",
      });
      orderForm.reset({
        ...orderForm.getValues(),
        name: "",
        instructions: "",
        dosage: "",
        route: "",
        frequency: "",
      });
      setActiveTab("orders");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create medical order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmitOrder = (data: OrderFormValues) => {
    createOrderMutation.mutate(data);
  };

  // Status badge color utility
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-secondary/10 text-secondary";
      case "completed":
        return "bg-secondary/10 text-secondary";
      case "pending":
        return "bg-primary/10 text-primary";
      case "cancelled":
        return "bg-alert/10 text-alert";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  if (isLoadingPatient) {
    return <div>Loading patient information...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-2" 
          onClick={() => navigate("/patients")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to patients
        </Button>
        
        {patient && (
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Patient EMR: {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-gray-500">ID: {patient.patientId}</p>
            </div>
            <Badge className={getStatusBadgeClass(patient.status)}>
              {patient.status}
            </Badge>
          </div>
        )}
      </div>

      <Tabs 
        defaultValue="records" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="orders">Medical Orders</TabsTrigger>
          <TabsTrigger value="newRecord">New Record</TabsTrigger>
          <TabsTrigger value="newOrder">New Order</TabsTrigger>
          <TabsTrigger value="summary">Patient Summary</TabsTrigger>
        </TabsList>

        {/* Medical Records Tab */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Medical Records History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRecords ? (
                <div>Loading medical records...</div>
              ) : medicalRecords.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No medical records found for this patient.
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalRecords.map((record: any) => (
                    <Card key={record.id} className="border p-4">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium">
                          Record #{record.id} - {formatDate(record.date)}
                        </h3>
                        <span className="text-sm text-gray-500">
                          Dr. {record.doctorName || "Unknown"}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-1">Subjective (S)</h4>
                          <p className="text-sm">{record.subjective}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-1">Objective (O)</h4>
                          <p className="text-sm">{record.objective}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-1">Assessment (A)</h4>
                          <p className="text-sm">{record.assessment}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-1">Plan (P)</h4>
                          <p className="text-sm">{record.plan}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Medical Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div>Loading medical orders...</div>
              ) : medicalOrders.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No medical orders found for this patient.
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalOrders.map((order: any) => (
                    <Card key={order.id} className="border p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-medium">
                            {order.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {order.orderType.toUpperCase()} - Ordered on {formatDate(order.orderDate)}
                          </span>
                        </div>
                        <Badge className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-1">Instructions</h4>
                          <p className="text-sm">{order.instructions || "No specific instructions"}</p>
                        </div>
                        {order.orderType === "medication" && (
                          <>
                            <div>
                              <h4 className="font-semibold text-sm text-primary mb-1">Dosage</h4>
                              <p className="text-sm">{order.dosage}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-primary mb-1">Route</h4>
                              <p className="text-sm">{order.route}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-primary mb-1">Frequency</h4>
                              <p className="text-sm">{order.frequency}</p>
                            </div>
                          </>
                        )}
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-1">Duration</h4>
                          <p className="text-sm">
                            {formatDate(order.startDate)} 
                            {order.endDate ? ` to ${formatDate(order.endDate)}` : " - Ongoing"}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-1">Priority</h4>
                          <p className="text-sm capitalize">{order.priority}</p>
                        </div>
                        {order.notes && (
                          <div className="col-span-2">
                            <h4 className="font-semibold text-sm text-primary mb-1">Notes</h4>
                            <p className="text-sm">{order.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Print Prescription Button */}
                      {order.orderType === "medication" && (
                        <div className="mt-4 flex justify-end">
                          <PrintPrescription 
                            patient={patient} 
                            order={order} 
                            doctor={user?.user || { name: "Doctor", username: "Unknown" }}
                            hospital={{
                              name: "Hospital ERP System",
                              address: "123 Healthcare Ave, Medical District",
                              phone: "(123) 456-7890"
                            }}
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create New Record Tab */}
        <TabsContent value="newRecord">
          <Card>
            <CardHeader>
              <CardTitle>Create New Medical Record</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="subjective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subjective (S) - Chief Complaint</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Patient's symptoms, concerns, and history of present illness"
                              {...field}
                              className="min-h-28"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="objective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objective (O) - Clinical Findings</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Vital signs, physical examination findings, and test results"
                              {...field}
                              className="min-h-28"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="assessment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assessment (A) - Diagnosis</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Diagnosis or differential diagnoses based on subjective and objective information"
                              {...field}
                              className="min-h-28"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="plan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plan (P) - Treatment Plan</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Treatment plan, medications, procedures, patient education, and follow-up instructions"
                              {...field}
                              className="min-h-28"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        form.reset();
                        setActiveTab("records");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createRecordMutation.isPending}
                    >
                      {createRecordMutation.isPending ? "Saving..." : "Save Record"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create New Order Tab */}
        <TabsContent value="newOrder">
          <Card>
            <CardHeader>
              <CardTitle>Create New Medical Order</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...orderForm}>
                <form onSubmit={orderForm.handleSubmit(onSubmitOrder)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={orderForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter order name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={orderForm.control}
                      name="orderType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Type</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="medication">Medication</SelectItem>
                                <SelectItem value="lab">Laboratory Test</SelectItem>
                                <SelectItem value="imaging">Imaging</SelectItem>
                                <SelectItem value="procedure">Procedure</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={orderForm.control}
                      name="orderDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={orderForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              {...field}
                              value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={orderForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <FormControl>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="stat">STAT (Immediate)</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="routine">Routine</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {orderForm.watch("orderType") === "medication" && (
                      <>
                        <FormField
                          control={orderForm.control}
                          name="dosage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dosage</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 500mg twice daily" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={orderForm.control}
                          name="route"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Route</FormLabel>
                              <FormControl>
                                <Select 
                                  value={field.value || ""} 
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select route" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="oral">Oral (PO)</SelectItem>
                                    <SelectItem value="intravenous">Intravenous (IV)</SelectItem>
                                    <SelectItem value="intramuscular">Intramuscular (IM)</SelectItem>
                                    <SelectItem value="subcutaneous">Subcutaneous (SC)</SelectItem>
                                    <SelectItem value="topical">Topical</SelectItem>
                                    <SelectItem value="inhalation">Inhalation</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={orderForm.control}
                          name="frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequency</FormLabel>
                              <FormControl>
                                <Select 
                                  value={field.value || ""} 
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="once">Once daily</SelectItem>
                                    <SelectItem value="twice">Twice daily</SelectItem>
                                    <SelectItem value="three">Three times daily</SelectItem>
                                    <SelectItem value="four">Four times daily</SelectItem>
                                    <SelectItem value="prn">As needed (PRN)</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="stat">Immediately (STAT)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    
                    <div className="col-span-1 md:col-span-2">
                      <FormField
                        control={orderForm.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter detailed instructions" 
                                {...field}
                                className="min-h-20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        orderForm.reset({
                          ...orderForm.getValues(),
                          name: "",
                          instructions: "",
                          dosage: "",
                          route: "",
                          frequency: "",
                        });
                        setActiveTab("orders");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? "Saving..." : "Create Order"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patient Summary Tab */}
        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent>
                {patient && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p>{patient.firstName} {patient.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Patient ID</p>
                        <p>{patient.patientId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Gender</p>
                        <p>{patient.gender || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                        <p>{patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Blood Type</p>
                        <p>{patient.bloodType || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Status</p>
                        <Badge className={getStatusBadgeClass(patient.status)}>
                          {patient.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm font-medium text-gray-500">Contact Information</p>
                      <p>Email: {patient.email || "Not provided"}</p>
                      <p>Phone: {patient.phone || "Not provided"}</p>
                      <p>Address: {patient.address || "Not provided"}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Medical Records</h3>
                    {medicalRecords.length > 0 ? (
                      <p>{medicalRecords.length} record(s), last updated on {formatDate(medicalRecords[0].date)}</p>
                    ) : (
                      <p>No medical records</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Medical Orders</h3>
                    {medicalOrders.length > 0 ? (
                      <p>{medicalOrders.length} order(s), last updated on {formatDate(medicalOrders[0].orderDate)}</p>
                    ) : (
                      <p>No medical orders</p>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Actions</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab("newRecord")}
                      >
                        Add Medical Record
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/patients/${id}`)}
                      >
                        Edit Patient Info
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientEMR;