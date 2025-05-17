import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ArrowRight } from 'lucide-react';

const PricingSection = () => {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [isLoading, setIsLoading] = useState({
    basic: false,
    pro: false,
    enterprise: false
  });
  
  const toggleBilling = () => {
    setAnnualBilling(!annualBilling);
  };
  
  const calculatePrice = (monthly, discount = 0.2) => {
    if (annualBilling) {
      const annual = monthly * 12;
      const discounted = annual * (1 - discount);
      return (discounted / 12).toFixed(2);
    }
    return monthly.toFixed(2);
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Essential tools for individual investors',
      price: calculatePrice(19.99),
      originalPrice: 19.99,
      features: [
        'Market sentiment analysis (basic)',
        'Stock data & charts',
        'Portfolio tracking (up to 10 stocks)',
        'Daily market insights',
        'Email support'
      ],
      missing: [
        'AI investment recommendations',
        'Behavioral bias analysis',
        'Advanced technical indicators',
        'API access'
      ],
      cta: 'Start Free Trial',
      color: 'border-gray-200 hover:border-gray-300'
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Advanced tools for serious investors',
      price: calculatePrice(49.99),
      originalPrice: 49.99,
      popular: true,
      features: [
        'Everything in Basic',
        'Full sentiment analysis',
        'AI investment recommendations',
        'Behavioral bias detection',
        'Portfolio tracking (unlimited)',
        'Advanced technical indicators',
        'Priority email support'
      ],
      missing: [
        'API access',
        'Custom alerts'
      ],
      cta: 'Get Started',
      color: 'border-blue-500 shadow-blue-100'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Complete solution for professional traders',
      price: calculatePrice(99.99),
      originalPrice: 99.99,
      features: [
        'Everything in Pro',
        'API access',
        'Custom alerts',
        'Advanced risk modeling',
        'Multi-portfolio management',
        'Custom reporting',
        'Dedicated account manager',
        'Phone support'
      ],
      missing: [],
      cta: 'Contact Sales',
      color: 'border-gray-200 hover:border-gray-300'
    }
  ];

  // Handle the "Get Started" button click for all plans
  const handleGetStarted = (plan, price) => {
    // Track checkout initiation for marketing analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        event_category: 'ecommerce',
        event_label: plan,
        value: parseFloat(price), 
        items: [{
          plan: plan,
          price: parseFloat(price)
        }]
      });
    }
    
    // For the simplified standalone version, we'll just redirect to signup
    if (plan === 'enterprise') {
      window.location.href = '/contact';
    } else {
      window.location.href = `/register?plan=${plan}`;
    }
  };

  return (
    <section className="py-20 bg-white" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your investment needs. All plans include a 14-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <span className={`mr-3 ${annualBilling ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Annual Billing
              <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </span>
            <button 
              onClick={toggleBilling}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                annualBilling ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  annualBilling ? 'translate-x-6' : 'translate-x-1'
                }`} 
              />
            </button>
            <span className={`ml-3 ${!annualBilling ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly Billing
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`pricing-card ${plan.popular ? 'featured' : ''} ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 text-center">
                  <span className="bg-blue-600 text-white text-sm font-medium px-4 py-1 rounded-full shadow-md">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600">/mo</span>
                  {annualBilling && (
                    <div className="text-sm text-gray-500">
                      billed annually (${(plan.price * 12).toFixed(2)})
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleGetStarted(plan.id, plan.price)}
                  className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-white hover:bg-gray-100 text-blue-600 border border-blue-600'
                  }`}
                  disabled={isLoading[plan.id]}
                >
                  {isLoading[plan.id] ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              
              <div className="border-t border-gray-200 p-8">
                <p className="font-medium mb-4">What's included:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.missing.map((feature, index) => (
                    <li key={`missing-${index}`} className="flex items-start text-gray-400">
                      <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-500">
            All plans include a 14-day free trial. No credit card required to start.
          </p>
          <p className="text-gray-500 mt-2">
            Need a custom solution? <Link to="/contact" className="text-blue-600 hover:underline">Contact our sales team</Link>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;