
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, UserPlus } from "lucide-react";

const HR = () => {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  const filteredEmployees = employees.filter((employee: any) =>
    employee.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-textDark">HR Management</h1>
          <p className="text-midGrey">Manage employees and leave requests</p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => navigate("/hr/leaves")}>
            Leave Requests
          </Button>
          <Button onClick={() => navigate("/hr/new")}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-borderColor mb-6">
        <div className="relative w-full md:w-72 mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-midGrey h-4 w-4" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee: any) => (
            <Card key={employee.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{employee.user?.name}</span>
                  <span className="text-sm text-midGrey">{employee.department}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {employee.user?.name.split(" ").map((n: string) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{employee.position}</p>
                    <p className="text-sm text-midGrey">Joined: {new Date(employee.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HR;
