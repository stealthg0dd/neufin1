import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for individual investors",
      price: 29,
      features: [
        "Basic sentiment analysis",
        "Stock data for 50 companies",
        "Weekly recommendations",
        "Basic bias analysis",
      ],
      isPopular: false,
      buttonText: "Get started",
      buttonVariant: "outline",
    },
    {
      name: "Professional",
      description: "Ideal for active traders",
      price: 79,
      features: [
        "Advanced sentiment analysis",
        "Unlimited stock data",
        "Daily recommendations",
        "Comprehensive bias analysis",
        "Portfolio optimization",
      ],
      isPopular: true,
      buttonText: "Get started",
      buttonVariant: "default",
    },
    {
      name: "Enterprise",
      description: "For institutional investors",
      price: 249,
      features: [
        "Enterprise-grade sentiment analysis",
        "Custom data integrations",
        "Real-time recommendations",
        "Team bias analysis",
        "Dedicated account manager",
      ],
      isPopular: false,
      buttonText: "Contact sales",
      buttonVariant: "outline",
    },
  ];

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-xl text-neutral-600 max-w-3xl mx-auto">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`${
                plan.isPopular
                  ? "relative bg-white rounded-xl border-2 border-primary p-6 shadow-lg transform md:-translate-y-4 hover:shadow-xl transition-shadow"
                  : "bg-neutral-50 rounded-xl p-6 hover:shadow-md transition-shadow"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
              <p className="text-neutral-600 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">${plan.price}</span>
                <span className="text-neutral-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="h-5 w-5 text-sentiment-positive mt-1 mr-2" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.buttonVariant as "outline" | "default"}
                className={`w-full ${
                  plan.buttonVariant === "outline"
                    ? "text-primary border-primary hover:bg-primary hover:text-white transition-colors"
                    : "bg-primary hover:bg-primary-dark"
                }`}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
