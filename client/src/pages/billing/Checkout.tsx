import { useState, useEffect } from 'react';
import { useStripe, useElements, Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  clientSecret: string;
  billId: number;
  amount: string;
}

const CheckoutForm = ({ clientSecret, billId, amount }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/billing/payments',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message || 'An error occurred during payment processing',
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded, update the bill
        await apiRequest('POST', '/api/confirm-payment', {
          billId: billId,
          paymentIntentId: paymentIntent.id,
        });

        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully',
        });

        // Navigate back to payments page
        navigate('/billing/payments');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${parseFloat(amount).toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [location] = useLocation();
  const [clientSecret, setClientSecret] = useState('');
  const [billId, setBillId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Extract billId from the URL query string
    const params = new URLSearchParams(location.split('?')[1]);
    const billIdParam = params.get('billId');

    if (!billIdParam) {
      setError('Missing bill ID. Please go back and try again.');
      setLoading(false);
      return;
    }

    const fetchPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('POST', '/api/create-payment-intent', {
          billId: billIdParam,
        });

        const data = await response.json();
        
        if (response.ok) {
          setClientSecret(data.clientSecret);
          setBillId(data.billId);
          
          // Fetch bill details to get the amount
          const billResponse = await apiRequest('GET', `/api/bills/${data.billId}`);
          const billData = await billResponse.json();
          
          if (billResponse.ok) {
            setAmount(billData.totalAmount);
          } else {
            throw new Error('Failed to fetch bill details');
          }
        } else {
          throw new Error(data.message || 'Failed to initialize payment');
        }
      } catch (err: any) {
        console.error('Payment intent creation error:', err);
        setError(err.message || 'Failed to initialize payment');
        
        toast({
          title: 'Payment Initialization Failed',
          description: err.message || 'There was an error initializing the payment process. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [location, toast]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <CardDescription>
            Enter your card details to pay invoice #{billId}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientSecret && billId && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} billId={billId} amount={amount} />
            </Elements>
          )}
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