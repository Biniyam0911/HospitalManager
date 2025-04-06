
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Calendar, Search, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertImagingStudySchema } from "@shared/schema";
import type { InsertImagingStudy } from "@shared/schema";

export default function ImagingStudies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddStudy, setShowAddStudy] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      studyType: "",
      bodyPart: "",
      priority: "routine",
      status: "ordered",
      scheduledDate: new Date().toISOString(),
    }
  });

  const { data: studies = [], isLoading } = useQuery({
    queryKey: ["imaging-studies"],
    queryFn: async () => {
      const res = await fetch("/api/imaging-studies");
      return res.json();
    },
  });

  const createStudyMutation = useMutation({
    mutationFn: async (data: InsertImagingStudy) => {
      const res = await fetch("/api/imaging-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create study");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imaging-studies"] });
      setShowAddStudy(false);
      toast({
        title: "Success",
        description: "Imaging study created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create imaging study",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createStudyMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  const filteredStudies = studies.filter((study: any) =>
    study.studyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    study.bodyPart.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {filteredStudies.map((study: any) => (
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
          <DialogHeader>
            <DialogTitle>New Imaging Study</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="studyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Study Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select study type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="X-Ray">X-Ray</SelectItem>
                        <SelectItem value="CT">CT</SelectItem>
                        <SelectItem value="MRI">MRI</SelectItem>
                        <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bodyPart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Part</FormLabel>
                    <Input {...field} placeholder="Enter body part" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="stat">STAT</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setShowAddStudy(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Study</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
