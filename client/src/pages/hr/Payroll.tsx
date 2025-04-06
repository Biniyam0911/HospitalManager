
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Payroll() {
  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-textDark">Payroll Management</h1>
          <p className="text-midGrey">Manage employee salaries and payments</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Net Salary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee: any) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.user?.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>${employee.salary}</TableCell>
                  <TableCell>$0</TableCell>
                  <TableCell>${employee.salary}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
