
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmergencyCaseSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

type FormValues = z.infer<typeof insertEmergencyCaseSchema>;

const EmergencyForm = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: doctors = [] } = useQuery({
    queryKey: ["/api/users"],
    select: (users: any[]) => users.filter(user => user.role === "doctor"),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(insertEmergencyCaseSchema),
    defaultValues: {
      triageLevel: "yellow",
      arrivalMode: "walk-in",
      status: "waiting",
    },
  });

  const createEmergencyCaseMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest("POST", "/api/emergency-cases", data);
      if (!response.ok) {
        throw new Error("Failed to create emergency case");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emergency-cases"] });
      toast({
        title: "Emergency case created",
        description: "The emergency case has been successfully registered.",
      });
      navigate("/emergency");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create emergency case. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    createEmergencyCaseMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate("/emergency")}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Emergency Department
      </Button>

      <Card className="max-w-2xl mx-auto p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="triageLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Triage Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select triage level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="red">Red (Immediate)</SelectItem>
                      <SelectItem value="yellow">Yellow (Urgent)</SelectItem>
                      <SelectItem value="green">Green (Non-urgent)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chiefComplaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chief Complaint</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the main complaint or symptoms"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="arrivalMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arrival Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select arrival mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ambulance">Ambulance</SelectItem>
                      <SelectItem value="walk-in">Walk-in</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedDoctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Doctor (Optional)</FormLabel>
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
                      {doctors.map((doctor: any) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Register Emergency Case
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default EmergencyForm;
