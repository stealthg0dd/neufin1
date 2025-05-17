import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQSection() {
  const faqs = [
    {
      question: "How accurate is Neufin's sentiment analysis?",
      answer:
        "Neufin's sentiment analysis has been proven to be over 85% accurate in predicting market movements based on collective sentiment indicators. Our AI models are trained on millions of financial data points and continuously improve through machine learning.",
    },
    {
      question: "What data sources does Neufin use?",
      answer:
        "Neufin aggregates data from a wide range of sources including financial news outlets, social media platforms, SEC filings, earnings reports, macroeconomic indicators, and market data. All data is processed and analyzed in real-time to provide the most current insights.",
    },
    {
      question: "How does the behavioral bias analyzer work?",
      answer:
        "The behavioral bias analyzer tracks your investment decisions and identifies patterns that may indicate cognitive biases such as loss aversion, confirmation bias, or recency bias. By analyzing your trading history and behavior, it provides personalized insights and nudges to help you make more rational, objective investment decisions.",
    },
    {
      question: "Can I integrate Neufin with my existing investment platform?",
      answer:
        "Yes, Neufin provides API integration capabilities that allow you to connect with popular brokerages and investment platforms. Our Enterprise plan also offers custom integrations tailored to your specific requirements. Contact our sales team for more details on compatible platforms and integration options.",
    },
    {
      question: "Is my financial data secure with Neufin?",
      answer:
        "Absolutely. Neufin employs industry-leading security measures including encryption, secure authentication, and regular security audits. We are SOC 2 Type II compliant and adhere to all relevant data protection regulations. Your data privacy is our top priority, and we never sell your personal information to third parties.",
    },
  ];

  return (
    <section id="faq" className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-3">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-xl text-neutral-600 max-w-3xl mx-auto">
            Everything you need to know about Neufin
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-6">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden border-none"
              >
                <AccordionTrigger className="px-6 py-4 text-lg font-medium text-neutral-900 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-neutral-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
