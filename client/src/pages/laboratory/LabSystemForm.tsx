import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Define the form validation schema
const labSystemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  type: z.string().min(1, "Please select a system type"),
  url: z.string().url("Please enter a valid URL"),
  username: z.string().optional(),
  password: z.string().optional(),
  apiKey: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  syncSettings: z.object({
    frequency: z.string().optional(),
    retention: z.string().optional(),
    autoSync: z.boolean().default(false),
  }),
});

// Define the form values type from the schema
type LabSystemFormValues = z.infer<typeof labSystemSchema>;

// Define the component props
interface LabSystemFormProps {
  labSystem?: any;
  onSuccess: () => void;
}

export function LabSystemForm({ labSystem, onSuccess }: LabSystemFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize the form with default values or existing lab system data
  const form = useForm<LabSystemFormValues>({
    resolver: zodResolver(labSystemSchema),
    defaultValues: {
      name: "",
      type: "",
      url: "",
      username: "",
      password: "",
      apiKey: "",
      description: "",
      isActive: true,
      syncSettings: {
        frequency: "manual",
        retention: "30days",
        autoSync: false,
      },
    },
  });

  // Update form with lab system data if editing
  useEffect(() => {
    if (labSystem) {
      form.reset({
        name: labSystem.name || "",
        type: labSystem.type || "",
        url: labSystem.url || "",
        username: labSystem.credentials?.username || "",
        password: "", // Don't pre-fill password for security
        apiKey: labSystem.credentials?.apiKey ? "••••••••••••" : "", // Mask API key if present
        description: labSystem.description || "",
        isActive: labSystem.status === "active",
        syncSettings: {
          frequency: labSystem.settings?.syncFrequency || "manual",
          retention: labSystem.settings?.retention || "30days",
          autoSync: labSystem.settings?.autoSync || false,
        },
      });
    }
  }, [labSystem, form]);

  // Create mutation for adding/updating lab system
  const mutation = useMutation({
    mutationFn: (data: LabSystemFormValues) => {
      // Format data for API
      const formattedData = {
        name: data.name,
        type: data.type,
        url: data.url,
        status: data.isActive ? "active" : "inactive",
        description: data.description || "",
        credentials: {
          username: data.username || null,
          password: data.password || null,
          apiKey: data.apiKey === "••••••••••••" ? undefined : data.apiKey || null,
        },
        settings: {
          syncFrequency: data.syncSettings.frequency,
          retention: data.syncSettings.retention,
          autoSync: data.syncSettings.autoSync,
        },
      };

      if (labSystem?.id) {
        // Update existing lab system
        return apiRequest("PUT", `/api/lab-systems/${labSystem.id}`, formattedData);
      } else {
        // Create new lab system
        return apiRequest("POST", "/api/lab-systems", formattedData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lab-systems"] });
      toast({
        title: labSystem ? "Lab System Updated" : "Lab System Added",
        description: labSystem
          ? "The laboratory system has been updated successfully."
          : "A new laboratory system has been added successfully.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${labSystem ? "update" : "add"} laboratory system. Please try again.`,
        variant: "destructive",
      });
      console.error("Mutation error:", error);
    },
  });

  // Form submission handler
  const onSubmit = (data: LabSystemFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter laboratory system name" {...field} />
                </FormControl>
                <FormDescription>
                  A descriptive name for the laboratory system.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select system type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="lis">Laboratory Information System (LIS)</SelectItem>
                    <SelectItem value="lims">Lab Information Management System (LIMS)</SelectItem>
                    <SelectItem value="fhir">FHIR API</SelectItem>
                    <SelectItem value="hl7">HL7 Interface</SelectItem>
                    <SelectItem value="rest">REST API</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The type of laboratory system or integration protocol.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Connection URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://lab-api.example.com" {...field} />
                </FormControl>
                <FormDescription>
                  The URL endpoint for the laboratory system API.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a description for this lab system..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional details about this integration.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Authentication</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={labSystem ? "••••••••••••" : "Enter password"}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {labSystem ? "Leave blank to keep existing password" : ""}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem className="col-span-1 sm:col-span-2">
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={labSystem?.credentials?.apiKey ? "••••••••••••" : "Enter API key"}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {labSystem?.credentials?.apiKey ? "Leave masked to keep existing API key" : "Optional API key for authentication"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Sync Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="syncSettings.frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sync Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="syncSettings.retention"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Retention</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select retention period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="7days">7 Days</SelectItem>
                      <SelectItem value="30days">30 Days</SelectItem>
                      <SelectItem value="90days">90 Days</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="syncSettings.autoSync"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-1 sm:col-span-2">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Automatic Sync</FormLabel>
                    <FormDescription>
                      Automatically sync with this lab system based on the frequency.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status</FormLabel>
                <FormDescription>
                  Enable or disable this laboratory integration.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {labSystem ? "Update" : "Add"} Lab System
          </Button>
        </div>
      </form>
    </Form>
  );
}