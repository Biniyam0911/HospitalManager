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

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Plus } from "lucide-react";

// Create a form schema based on insertMedicalRecordSchema 
const medicalRecordFormSchema = insertMedicalRecordSchema.extend({
  subjective: z.string().min(1, "Chief complaint is required"),
  objective: z.string().min(1, "Clinical findings are required"),
  assessment: z.string().min(1, "Diagnosis is required"),
  plan: z.string().min(1, "Treatment plan is required"),
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordFormSchema>;

// Create a form schema for medical orders
const medicalOrderFormSchema = insertMedicalOrderSchema.extend({
  name: z.string().min(1, "Order name is required"),
  orderType: z.string().min(1, "Order type is required"),
  orderDate: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  startDate: z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
  }, z.date()),
  priority: z.string().min(1, "Priority is required"),
  instructions: z.string().optional(),
  dosage: z.string().optional(),
  route: z.string().optional(),
  frequency: z.string().optional(),
});

type MedicalOrderFormValues = z.infer<typeof medicalOrderFormSchema>;

const InpatientEMR = ({ id }: { id: string }) => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("records");

  // Fetch admission data
  const { data: admission, isLoading: isLoadingAdmission } = useQuery({
    queryKey: [`/api/admissions/${id}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admissions/${id}`);
      return res.json();
    },
  });

  // Fetch patient data if admission is loaded
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: [`/api/patients/${admission?.patientId}`],
    enabled: !!admission?.patientId,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/patients/${admission?.patientId}`);
      return res.json();
    }
  });

  // Fetch bed data
  const { data: bed, isLoading: isLoadingBed } = useQuery({
    queryKey: [`/api/beds/${admission?.bedId}`],
    enabled: !!admission?.bedId,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/beds/${admission?.bedId}`);
      return res.json();
    }
  });

  // Fetch ward data
  const { data: ward } = useQuery({
    queryKey: [`/api/wards/${bed?.wardId}`],
    enabled: !!bed?.wardId,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/wards/${bed?.wardId}`);
      return res.json();
    }
  });

  // Fetch medical records for this admission
  const { data: medicalRecords = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ["/api/medical-records/patient", admission?.patientId],
    enabled: !!admission?.patientId,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/medical-records/patient/${admission?.patientId}`);
      return res.json();
    },
  });

  // Fetch medical orders for this admission
  const { data: medicalOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["/api/medical-orders/admission", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/medical-orders/admission/${id}`);
      return res.json();
    },
  });

  // Fetch treatments for this admission
  const { data: treatments = [], isLoading: isLoadingTreatments } = useQuery({
    queryKey: ["/api/treatments/admission", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/treatments/admission/${id}`);
      return res.json();
    },
  });

  // Fetch the user/doctor data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/session"],
  });

  // Medical record form setup
  const recordForm = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordFormSchema),
    defaultValues: {
      patientId: admission?.patientId || 0,
      doctorId: user?.id || 1, // Default to the first doctor if none is logged in
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
    },
  });

  // Medical order form setup
  const orderForm = useForm<MedicalOrderFormValues>({
    resolver: zodResolver(medicalOrderFormSchema),
    defaultValues: {
      patientId: admission?.patientId || 0,
      doctorId: user?.id || 1,
      admissionId: parseInt(id),
      orderType: "medication",
      name: "",
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

  // Create medical record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: MedicalRecordFormValues) => {
      const response = await apiRequest("POST", "/api/medical-records", {
        ...data,
        patientId: admission?.patientId, // Ensure correct patient ID
      });
      if (!response.ok) {
        throw new Error("Failed to create medical record");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records/patient", admission?.patientId] });
      toast({
        title: "Medical record created",
        description: "The patient's medical record was successfully saved.",
        variant: "default",
      });
      recordForm.reset();
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

  // Create medical order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: MedicalOrderFormValues) => {
      const response = await apiRequest("POST", "/api/medical-orders", {
        ...data,
        patientId: admission?.patientId, // Ensure correct patient ID
        admissionId: parseInt(id),
      });
      if (!response.ok) {
        throw new Error("Failed to create medical order");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medical-orders/admission", id] });
      toast({
        title: "Medical order created",
        description: "The medical order was successfully created.",
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

  const onSubmitRecord = (data: MedicalRecordFormValues) => {
    createRecordMutation.mutate(data);
  };

  const onSubmitOrder = (data: MedicalOrderFormValues) => {
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
      case "discharged":
        return "bg-alert/10 text-alert";
      case "cancelled":
        return "bg-alert/10 text-alert";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  if (isLoadingAdmission || isLoadingPatient || isLoadingBed) {
    return <div>Loading patient information...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-2" 
          onClick={() => navigate("/inpatient/beds")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to inpatient services
        </Button>
        
        {/* Admission details header */}
        {patient && admission && (
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Inpatient EMR: {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-gray-500">Admission #{id} | {bed && ward ? `${ward.name}, Bed ${bed.bedNumber}` : "Loading bed info..."}</p>
            </div>
            <Badge className={getStatusBadgeClass(admission.status)}>
              {admission.status}
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
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="newRecord">New Record</TabsTrigger>
          <TabsTrigger value="newOrder">New Order</TabsTrigger>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Medical Orders</CardTitle>
                <CardDescription>Orders for the current admission</CardDescription>
              </div>
              <Button size="sm" onClick={() => setActiveTab("newOrder")}>
                <Plus className="h-4 w-4 mr-1" />
                New Order
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div>Loading medical orders...</div>
              ) : medicalOrders.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No medical orders found for this admission.
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
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatments Tab */}
        <TabsContent value="treatments">
          <Card>
            <CardHeader>
              <CardTitle>Treatments</CardTitle>
              <CardDescription>Current and historical treatments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTreatments ? (
                <div>Loading treatments...</div>
              ) : treatments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No treatments found for this admission.
                </div>
              ) : (
                <div className="space-y-4">
                  {treatments.map((treatment: any) => (
                    <Card key={treatment.id} className="border p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-medium">
                            {treatment.name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            Started on {formatDate(treatment.startDate)}
                          </span>
                        </div>
                        <Badge className={getStatusBadgeClass(treatment.status)}>
                          {treatment.status}
                        </Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {treatment.description && (
                          <div className="col-span-2">
                            <h4 className="font-semibold text-sm text-primary mb-1">Description</h4>
                            <p className="text-sm">{treatment.description}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-sm text-primary mb-1">Duration</h4>
                          <p className="text-sm">
                            {formatDate(treatment.startDate)} 
                            {treatment.endDate ? ` to ${formatDate(treatment.endDate)}` : " - Ongoing"}
                          </p>
                        </div>
                        {treatment.frequency && (
                          <div>
                            <h4 className="font-semibold text-sm text-primary mb-1">Frequency</h4>
                            <p className="text-sm">{treatment.frequency}</p>
                          </div>
                        )}
                        {treatment.notes && (
                          <div className="col-span-2">
                            <h4 className="font-semibold text-sm text-primary mb-1">Notes</h4>
                            <p className="text-sm">{treatment.notes}</p>
                          </div>
                        )}
                      </div>
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
              <Form {...recordForm}>
                <form onSubmit={recordForm.handleSubmit(onSubmitRecord)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={recordForm.control}
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
                      control={recordForm.control}
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
                      control={recordForm.control}
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
                      control={recordForm.control}
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
                        recordForm.reset();
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
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select order type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="medication">Medication</SelectItem>
                              <SelectItem value="lab">Laboratory Test</SelectItem>
                              <SelectItem value="imaging">Imaging</SelectItem>
                              <SelectItem value="procedure">Procedure</SelectItem>
                              <SelectItem value="consult">Consultation</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="stat">STAT (Immediate)</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                              <SelectItem value="routine">Routine</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="col-span-2">
                      <FormField
                        control={orderForm.control}
                        name="instructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter instructions for this order"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {orderForm.watch("orderType") === "medication" && (
                      <>
                        <FormField
                          control={orderForm.control}
                          name="dosage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dosage</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 500mg, 10ml, etc." {...field} />
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
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select administration route" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="oral">Oral</SelectItem>
                                  <SelectItem value="iv">Intravenous (IV)</SelectItem>
                                  <SelectItem value="im">Intramuscular (IM)</SelectItem>
                                  <SelectItem value="sc">Subcutaneous (SC)</SelectItem>
                                  <SelectItem value="topical">Topical</SelectItem>
                                  <SelectItem value="rectal">Rectal</SelectItem>
                                  <SelectItem value="inhalation">Inhalation</SelectItem>
                                </SelectContent>
                              </Select>
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
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select medication frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="once">Once</SelectItem>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="bid">BID (Twice daily)</SelectItem>
                                  <SelectItem value="tid">TID (Three times daily)</SelectItem>
                                  <SelectItem value="qid">QID (Four times daily)</SelectItem>
                                  <SelectItem value="prn">PRN (As needed)</SelectItem>
                                  <SelectItem value="qod">QOD (Every other day)</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
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
                      {createOrderMutation.isPending ? "Creating..." : "Create Order"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InpatientEMR;