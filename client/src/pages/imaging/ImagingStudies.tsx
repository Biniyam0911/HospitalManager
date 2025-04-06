
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Plus } from "lucide-react";

export default function ImagingStudies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddStudy, setShowAddStudy] = useState(false);

  const { data: studies, isLoading } = useQuery({
    queryKey: ["imaging-studies"],
    queryFn: async () => {
      const res = await fetch("/api/imaging-studies");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Imaging Studies</h1>
        <Button onClick={() => setShowAddStudy(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Study
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search studies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
          prefix={<Search className="h-4 w-4 text-gray-400" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {studies?.map((study: any) => (
          <Card key={study.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{study.studyType}</h3>
                  <p className="text-sm text-gray-500">{study.bodyPart}</p>
                </div>
                <Badge variant={study.status === 'completed' ? 'success' : 'warning'}>
                  {study.status}
                </Badge>
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(study.scheduledDate).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddStudy} onOpenChange={setShowAddStudy}>
        <DialogContent>
          <h2 className="text-xl font-semibold mb-4">New Imaging Study</h2>
          {/* Add form here */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
