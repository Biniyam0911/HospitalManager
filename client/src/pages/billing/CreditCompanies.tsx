import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Edit, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';

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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';

const creditCompanyFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  status: z.string().default('active'),
  email: z.string().email('Invalid email').nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  discountPercentage: z.string().nullable().optional(),
  contactPerson: z.string().nullable().optional(),
  contractStartDate: z.date().nullable().optional(),
  contractEndDate: z.date().nullable().optional(),
  paymentTerms: z.string().nullable().optional(),
});

type CreditCompanyFormValues = z.infer<typeof creditCompanyFormSchema>;

export default function CreditCompanies() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: creditCompanies, isLoading } = useQuery({
    queryKey: ['/api/credit-companies'],
    staleTime: 10000,
  });

  const createCreditCompanyMutation = useMutation({
    mutationFn: async (data: CreditCompanyFormValues) => {
      return apiRequest('POST', '/api/credit-companies', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credit-companies'] });
      toast({
        title: 'Success',
        description: 'Credit company has been created',
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create credit company',
        variant: 'destructive',
      });
    },
  });

  const updateCreditCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreditCompanyFormValues }) => {
      return apiRequest('PATCH', `/api/credit-companies/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credit-companies'] });
      toast({
        title: 'Success',
        description: 'Credit company has been updated',
      });
      setIsOpen(false);
      setEditingCompany(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update credit company',
        variant: 'destructive',
      });
    },
  });

  const form = useForm<CreditCompanyFormValues>({
    resolver: zodResolver(creditCompanyFormSchema),
    defaultValues: {
      name: '',
      code: '',
      status: 'active',
      email: null,
      phone: null,
      address: null,
      notes: null,
      discountPercentage: null,
      contactPerson: null,
      contractStartDate: null,
      contractEndDate: null,
      paymentTerms: null,
    },
  });

  function onSubmit(data: CreditCompanyFormValues) {
    if (editingCompany) {
      updateCreditCompanyMutation.mutate({ id: editingCompany.id, data });
    } else {
      createCreditCompanyMutation.mutate(data);
    }
  }

  function handleEditCompany(company: any) {
    setEditingCompany(company);
    
    form.reset({
      name: company.name,
      code: company.code,
      status: company.status,
      email: company.email,
      phone: company.phone,
      address: company.address,
      notes: company.notes,
      discountPercentage: company.discountPercentage,
      contactPerson: company.contactPerson,
      contractStartDate: company.contractStartDate ? new Date(company.contractStartDate) : null,
      contractEndDate: company.contractEndDate ? new Date(company.contractEndDate) : null,
      paymentTerms: company.paymentTerms,
    });
    
    setIsOpen(true);
  }

  function handleAddNew() {
    setEditingCompany(null);
    form.reset({
      name: '',
      code: '',
      status: 'active',
      email: null,
      phone: null,
      address: null,
      notes: null,
      discountPercentage: null,
      contactPerson: null,
      contractStartDate: null,
      contractEndDate: null,
      paymentTerms: null,
    });
    setIsOpen(true);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Credit Companies</h1>
          <p className="text-muted-foreground">
            Manage insurance providers and credit companies
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Company
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Companies</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!isLoading && creditCompanies?.map((company: any) => (
              <CreditCompanyCard 
                key={company.id} 
                company={company} 
                onEdit={handleEditCompany} 
              />
            ))}
            {isLoading && (
              <div className="col-span-3 flex justify-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            )}
            {!isLoading && (!creditCompanies || creditCompanies.length === 0) && (
              <div className="col-span-3 text-center py-10">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-semibold">No credit companies found</h3>
                <p className="text-muted-foreground">Click "Add Company" to create one</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!isLoading && creditCompanies?.filter((company: any) => company.status === 'active').map((company: any) => (
              <CreditCompanyCard 
                key={company.id} 
                company={company} 
                onEdit={handleEditCompany} 
              />
            ))}
            {isLoading && (
              <div className="col-span-3 flex justify-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            )}
            {!isLoading && (!creditCompanies || creditCompanies.filter((company: any) => company.status === 'active').length === 0) && (
              <div className="col-span-3 text-center py-10">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-semibold">No active credit companies found</h3>
                <p className="text-muted-foreground">All companies are inactive or not created yet</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="inactive">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!isLoading && creditCompanies?.filter((company: any) => company.status === 'inactive').map((company: any) => (
              <CreditCompanyCard 
                key={company.id} 
                company={company} 
                onEdit={handleEditCompany} 
              />
            ))}
            {isLoading && (
              <div className="col-span-3 flex justify-center py-10">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            )}
            {!isLoading && (!creditCompanies || creditCompanies.filter((company: any) => company.status === 'inactive').length === 0) && (
              <div className="col-span-3 text-center py-10">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-semibold">No inactive credit companies found</h3>
                <p className="text-muted-foreground">All companies are active or not created yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Edit Credit Company' : 'Add New Credit Company'}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter company name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. INS-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Percentage</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''} 
                          placeholder="e.g. 10" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''} 
                          placeholder="email@example.com" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ''} 
                          placeholder="e.g. 555-123-4567" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ''} 
                        placeholder="Company address" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ''} 
                        placeholder="Primary contact name" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contractStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Start Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value ? format(field.value, 'yyyy-MM-dd') : ''} 
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            field.onChange(date);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contractEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract End Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value ? format(field.value, 'yyyy-MM-dd') : ''} 
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            field.onChange(date);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ''} 
                        placeholder="e.g. Net 30" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ''} 
                        placeholder="Additional notes about this company" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createCreditCompanyMutation.isPending || updateCreditCompanyMutation.isPending}
                >
                  {(createCreditCompanyMutation.isPending || updateCreditCompanyMutation.isPending) && (
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  )}
                  {editingCompany ? 'Update' : 'Create'} Company
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreditCompanyCard({ company, onEdit }: { company: any, onEdit: (company: any) => void }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {company.name}
            </CardTitle>
            <CardDescription>Code: {company.code}</CardDescription>
          </div>
          <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
            {company.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {company.discountPercentage && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-sm font-medium">
              {company.discountPercentage}% Discount
            </span>
          </div>
        )}
        
        <div className="space-y-3 text-sm">
          {company.contactPerson && (
            <div>
              <span className="font-medium">Contact:</span> {company.contactPerson}
            </div>
          )}
          
          {company.email && (
            <div>
              <span className="font-medium">Email:</span> {company.email}
            </div>
          )}
          
          {company.phone && (
            <div>
              <span className="font-medium">Phone:</span> {company.phone}
            </div>
          )}
          
          {company.contractStartDate && company.contractEndDate && (
            <div>
              <span className="font-medium">Contract Period:</span> {formatDate(company.contractStartDate)} to {formatDate(company.contractEndDate)}
            </div>
          )}
          
          {company.paymentTerms && (
            <div>
              <span className="font-medium">Terms:</span> {company.paymentTerms}
            </div>
          )}
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(company)}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}