import { useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PricingSection() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    basic: false,
    pro: false,
    enterprise: false
  });

  const handleGetStarted = async (plan: string, price: number) => {
    setIsLoading({...isLoading, [plan]: true});

    try {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        plan,
        amount: price
      });
      
      if (!response.ok) {
        throw new Error('Payment initialization failed');
      }
      
      const data = await response.json();
      
      // Redirect to checkout page with the client secret
      navigate(`/checkout?clientSecret=${data.clientSecret}&plan=${plan}`);
    } catch (error) {
      console.error('Error starting payment process:', error);
      toast({
        title: "Payment Error",
        description: "Unable to initiate payment process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading({...isLoading, [plan]: false});
    }
  };

  const pricingTiers = [
    {
      name: "Basic",
      id: "basic",
      price: 9.99,
      description: "Essential tools for casual investors",
      features: [
        "Market sentiment analysis",
        "Basic stock insights",
        "Limited AI recommendations",
        "Basic behavioral bias detection",
        "Email support"
      ],
      limitations: [
        "Limited to 10 stocks",
        "Daily data updates only",
        "No premium recommendations"
      ]
    },
    {
      name: "Pro",
      id: "pro",
      price: 29.99,
      popular: true,
      description: "Advanced features for serious investors",
      features: [
        "Real-time sentiment analysis",
        "Advanced stock intelligence",
        "Unlimited AI recommendations",
        "Full behavioral bias analysis",
        "Priority email & chat support",
        "Portfolio integration",
        "Custom alerts"
      ],
      limitations: []
    },
    {
      name: "Enterprise",
      id: "enterprise",
      price: 99.99,
      description: "Complete solution for professional traders",
      features: [
        "Everything in Pro",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced AI models",
        "Team collaboration tools",
        "24/7 premium support"
      ],
      limitations: []
    }
  ];

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Choose the right plan for you
          </h2>
          <p className="mt-4 text-xl text-neutral-600 max-w-3xl mx-auto">
            Flexible pricing to meet your investment intelligence needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id}
              className={`shadow-md hover:shadow-lg transition-all ${
                tier.popular ? 'ring-2 ring-primary border-primary relative' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription className="text-neutral-600">
                  {tier.description}
                </CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${tier.price}</span>
                  <span className="text-neutral-500 ml-1">/month</span>
                </div>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-neutral-900 mb-2">Includes:</p>
                    <ul className="space-y-2">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-[#32D74B] mt-0.5 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {tier.limitations.length > 0 && (
                    <div>
                      <p className="font-medium text-neutral-900 mb-2">Limitations:</p>
                      <ul className="space-y-2">
                        {tier.limitations.map((limitation, i) => (
                          <li key={i} className="flex items-start text-neutral-600">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-neutral-400 mt-0.5 mr-2 flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Upgrade to remove this limitation</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={tier.popular ? "default" : "outline"}
                  onClick={() => handleGetStarted(tier.id, tier.price * 100)} // Convert to cents for Stripe
                  disabled={isLoading[tier.id]}
                >
                  {isLoading[tier.id] ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10 text-neutral-600">
          <p>All plans include a 14-day free trial. No credit card required to start.</p>
          <p className="mt-2">Need a custom solution? <a href="#contact" className="text-primary hover:underline">Contact us</a></p>
        </div>
      </div>
    </section>
  );
}