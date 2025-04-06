
import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";

export default function EmployeeForm() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    position: "",
    joinDate: "",
    status: "active"
  });

  const createEmployee = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create employee");
      return response.json();
    },
    onSuccess: () => {
      navigate("/hr");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmployee.mutate(formData);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-semibold mb-6">Add New Employee</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        <Input
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
        />
        <Input
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
        />
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <Input
          placeholder="Department"
          value={formData.department}
          onChange={(e) => setFormData({...formData, department: e.target.value})}
        />
        <Input
          placeholder="Position"
          value={formData.position}
          onChange={(e) => setFormData({...formData, position: e.target.value})}
        />
        <Input
          type="date"
          value={formData.joinDate}
          onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
        />
        <Button type="submit">Add Employee</Button>
      </form>
    </div>
  );
}
