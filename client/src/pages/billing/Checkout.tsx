import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

export default function Checkout() {
  const [location] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handlePayment = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(location.split('?')[1]);
      const billId = params.get('billId');

      if (!billId) {
        throw new Error('Missing bill ID');
      }

      // Fetch bill details
      const billResponse = await apiRequest('GET', `/api/bills/${billId}`);
      const billData = await billResponse.json();

      if (!billResponse.ok) {
        throw new Error('Failed to fetch bill details');
      }

      // Process payment directly
      const response = await apiRequest('POST', '/api/confirm-payment', {
        billId: parseInt(billId),
        amount: billData.totalAmount
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      toast({
        title: 'Payment Successful',
        description: 'Your payment has been processed successfully',
      });

      navigate('/billing/payments');
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed');

      toast({
        title: 'Payment Failed',
        description: err.message || 'There was an error processing your payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription className="text-destructive">{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/billing/payments')} className="w-full">
              Return to Payments
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
          <CardDescription>Click the button below to process your payment</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handlePayment} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => navigate('/billing/payments')}>
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}