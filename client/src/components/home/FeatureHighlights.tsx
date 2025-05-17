import {
  BarChart2,
  Brain,
  Lock,
  Bot
} from "lucide-react";

export default function FeatureHighlights() {
  const features = [
    {
      title: "Real-time Analysis",
      description: "Get instant insights on market sentiment and stock movements as they happen.",
      icon: <BarChart2 className="text-primary text-xl" />,
      color: "primary",
    },
    {
      title: "AI-Powered",
      description: "Leverage state-of-the-art FinBERT models and neural inference for accurate predictions.",
      icon: <Bot className="text-secondary text-xl" />,
      color: "secondary",
    },
    {
      title: "Behavioral Insights",
      description: "Identify and correct cognitive biases in your investment decision-making process.",
      icon: <Brain className="text-[#32D74B] text-xl" />,
      color: "sentiment-positive",
    },
    {
      title: "Secure & Private",
      description: "Enterprise-grade security with data encryption and privacy-first architecture.",
      icon: <Lock className="text-[#FF9F0A] text-xl" />,
      color: "sentiment-neutral",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900">
            The future of financial intelligence
          </h2>
          <p className="mt-4 text-xl text-neutral-600 max-w-3xl mx-auto">
            Neufin combines advanced AI with financial expertise to deliver actionable insights
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-neutral-50 rounded-xl p-6 transition-transform hover:scale-105 hover:shadow-md"
            >
              <div className={`w-12 h-12 rounded-full bg-${feature.color}/10 flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-neutral-900">{feature.title}</h3>
              <p className="mt-2 text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
