import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "wouter";
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements 
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Form component to handle payment submission
function CheckoutForm({ plan }: { plan: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/dashboard',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        setIsComplete(true);
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        
        // Wait 2 seconds before redirecting to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isComplete ? (
        <div className="text-center py-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="text-primary h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
          <p className="text-neutral-600">Thank you for your purchase. Redirecting you to the dashboard...</p>
        </div>
      ) : (
        <>
          <PaymentElement />
          <div className="flex justify-between items-center pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/pricing')}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={!stripe || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : (
                "Complete Payment"
              )}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

export default function Checkout() {
  const [location] = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string>("");
  const [plan, setPlan] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const secret = params.get('clientSecret');
    const planParam = params.get('plan');

    if (!secret || !planParam) {
      navigate('/pricing');
      return;
    }

    setClientSecret(secret);
    setPlan(planParam);
  }, [location, navigate]);

  const getPlanDetails = (planId: string) => {
    const plans: Record<string, { name: string, price: number }> = {
      basic: { name: "Basic", price: 9.99 },
      pro: { name: "Pro", price: 29.99 },
      enterprise: { name: "Enterprise", price: 99.99 }
    };

    return plans[planId] || { name: "Subscription", price: 0 };
  };

  const planDetails = getPlanDetails(plan);

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Complete Your Purchase</h1>
          <p className="text-neutral-600">Subscribe to the {planDetails.name} plan to unlock premium features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-neutral-200">
                  <span className="font-medium">{planDetails.name} Plan</span>
                  <span>${planDetails.price}/month</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Billed Monthly</span>
                  <span>${planDetails.price}/month</span>
                </div>
                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Due Today</span>
                    <span className="text-lg">${planDetails.price}</span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-2">
                    You can cancel your subscription anytime
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Enter your payment information</CardDescription>
            </CardHeader>
            <CardContent>
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#0047AB', // Match primary color
                    }
                  }
                }}
              >
                <CheckoutForm plan={plan} />
              </Elements>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-neutral-500">
          <p>By completing this purchase, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-2">Questions? Contact our support team at support@neufin.com</p>
        </div>
      </div>
    </div>
  );
}