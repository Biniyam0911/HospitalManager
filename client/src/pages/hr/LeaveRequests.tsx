
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function LeaveRequests() {
  const { data: leaves = [] } = useQuery({
    queryKey: ["/api/leaves"],
  });

  return (
    <div className="py-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.map((leave: any) => (
            <TableRow key={leave.id}>
              <TableCell>{leave.employee?.name}</TableCell>
              <TableCell>{leave.type}</TableCell>
              <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
              <TableCell>{leave.status}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
