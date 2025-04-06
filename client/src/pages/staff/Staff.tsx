import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Plus, MoreHorizontal, FileEdit, Trash, Phone, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Staff = () => {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const filteredUsers = users
    ? users.filter(
        (user: any) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.specialty && user.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];
  
  // Group staff by role
  const groupedStaff = filteredUsers.reduce((acc: any, user: any) => {
    if (!acc[user.role]) {
      acc[user.role] = [];
    }
    acc[user.role].push(user);
    return acc;
  }, {});

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Get role badge class
  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-primary/10 text-primary";
      case "doctor":
        return "bg-secondary/10 text-secondary";
      case "nurse":
        return "bg-alert/10 text-alert";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-textDark">Staff Management</h1>
          <p className="text-midGrey">Manage hospital staff and their roles</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => navigate("/staff/new")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-borderColor mb-6">
        <div className="relative w-full md:w-72 mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-midGrey h-4 w-4" />
          <Input
            type="search"
            placeholder="Search staff..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedStaff).map(([role, users]: [string, any]) => (
              <div key={role}>
                <h2 className="text-lg font-medium mb-3 capitalize">{role}s</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((user: any) => (
                    <Card key={user.id} className="overflow-hidden">
                      <CardHeader className="bg-neutral/50 p-4">
                        <CardTitle className="text-base flex justify-between items-center">
                          <span>{user.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeClass(user.role)}`}>
                            {user.role}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12 border border-borderColor">
                            <AvatarFallback className="bg-primary/10 text-primary">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            {user.specialty && (
                              <p className="text-sm text-midGrey mb-2">{user.specialty}</p>
                            )}
                            <div className="flex flex-col space-y-1 text-sm">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-midGrey" />
                                <span>{user.email}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-midGrey" />
                                <span>Not available</span>
                              </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => alert("Feature not implemented")}>
                                    <FileEdit className="h-4 w-4 mr-2" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => alert("Feature not implemented")}>
                                    <Trash className="h-4 w-4 mr-2" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(groupedStaff).length === 0 && (
              <div className="text-center p-6 bg-neutral/30 rounded-lg">
                <p className="text-midGrey">No staff members found matching your search</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Staff;
