
import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  joinDate: z.string().min(1, "Join date is required"),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  salary: z.string().optional(),
  status: z.string().default("active")
});

type FormValues = z.infer<typeof formSchema>;

export default function EmployeeForm({ onSuccess }: { onSuccess?: () => void }) {
  const [, navigate] = useLocation();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "active"
    }
  });

  const createEmployee = useMutation({
    mutationFn: async (data: FormValues) => {
      // First create a user
      const userResponse = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.email,
          password: "defaultpass123", // You should implement proper password handling
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          role: "employee"
        })
      });
      
      if (!userResponse.ok) throw new Error("Failed to create user");
      const user = await userResponse.json();

      // Then create the employee with the userId
      const employeeResponse = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          department: data.department,
          position: data.position,
          joinDate: new Date(data.joinDate).toISOString(),
          salary: data.salary,
          status: data.status,
          emergencyContact: data.emergencyContact,
          emergencyPhone: data.emergencyPhone
        })
      });

      if (!employeeResponse.ok) throw new Error("Failed to create employee");
      return employeeResponse.json();
    },
    onSuccess: () => {
      onSuccess?.();
      navigate("/hr");
    }
  });

  const onSubmit = (data: FormValues) => {
    createEmployee.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="joinDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Join Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contact</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Phone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          disabled={createEmployee.isPending}
        >
          {createEmployee.isPending ? "Creating..." : "Create Employee"}
        </Button>
      </form>
    </Form>
  );
}
