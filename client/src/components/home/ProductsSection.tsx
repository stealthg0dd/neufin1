import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import SentimentChart from "@/components/charts/SentimentChart";

export default function ProductsSection() {
  const [activeTab, setActiveTab] = useState("sentient");

  const tabData = {
    sentient: {
      title: "Real-time Market Sentiment Analysis",
      description:
        "Track market sentiment in real-time with AI-powered analysis of news, social media, and financial reports.",
      features: [
        "Dynamic sentiment scoring with color-coded indicators",
        "Trend analysis across different time periods",
        "News sentiment aggregation from trusted sources",
        "Social media sentiment tracking",
      ],
      learnMoreLink: "#",
    },
    nemo: {
      title: "Stock Intelligence Suite",
      description:
        "Comprehensive stock analysis with live data, comparative charts, fundamentals, and technical overlays.",
      features: [
        "Real-time stock data with advanced charting",
        "Side-by-side stock comparisons",
        "Fundamental analysis indicators",
        "Technical analysis overlays",
      ],
      learnMoreLink: "#",
    },
    o2: {
      title: "AI-Powered Investment Recommendations",
      description:
        "Personalized investment recommendations based on your goals, risk tolerance, and market conditions.",
      features: [
        "Personalized portfolio recommendations",
        "Risk-adjusted investment opportunities",
        "AI-driven asset allocation",
        "Market timing signals",
      ],
      learnMoreLink: "#",
    },
    bba: {
      title: "Behavioral Bias Analyzer",
      description:
        "Identify cognitive biases in your investment decisions and receive correctional recommendations.",
      features: [
        "Cognitive bias identification",
        "Decision pattern analysis",
        "Behavioral nudges and corrections",
        "Personal investment psychology profile",
      ],
      learnMoreLink: "#",
    },
  };

  const sentimentData = [
    {
      label: "Overall Sentiment",
      value: 78,
      status: "positive",
      change: 4.2,
      direction: "up",
    },
    {
      label: "Tech Sector",
      value: 52,
      status: "neutral",
      change: 1.3,
      direction: "down",
    },
    {
      label: "Finance Sector",
      value: 36,
      status: "negative",
      change: 7.1,
      direction: "down",
    },
  ];

  return (
    <section id="products" className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
            Our Products
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Complete financial intelligence suite
          </h2>
          <p className="mt-4 text-xl text-neutral-600 max-w-3xl mx-auto">
            Four powerful modules designed to transform your investment strategy
          </p>
        </div>

        {/* Product Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center border-b border-neutral-200">
            <button
              className={`px-4 py-3 text-center font-medium text-sm border-b-2 ${
                activeTab === "sentient"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-600 hover:text-primary"
              }`}
              onClick={() => setActiveTab("sentient")}
            >
              Neufin Sentient
            </button>
            <button
              className={`px-4 py-3 text-center font-medium text-sm border-b-2 ${
                activeTab === "nemo"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-600 hover:text-primary"
              }`}
              onClick={() => setActiveTab("nemo")}
            >
              Neufin Nemo
            </button>
            <button
              className={`px-4 py-3 text-center font-medium text-sm border-b-2 ${
                activeTab === "o2"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-600 hover:text-primary"
              }`}
              onClick={() => setActiveTab("o2")}
            >
              Neufin O2
            </button>
            <button
              className={`px-4 py-3 text-center font-medium text-sm border-b-2 ${
                activeTab === "bba"
                  ? "border-primary text-primary"
                  : "border-transparent text-neutral-600 hover:text-primary"
              }`}
              onClick={() => setActiveTab("bba")}
            >
              Neufin BBA
            </button>
          </div>
        </div>

        {/* Product Content */}
        <div className="product-content">
          <div className={activeTab === "sentient" ? "block" : "hidden"}>
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
              <div className="lg:col-span-5 mb-8 lg:mb-0">
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                  {tabData.sentient.title}
                </h3>
                <p className="text-lg text-neutral-600 mb-6">
                  {tabData.sentient.description}
                </p>
                <ul className="space-y-4">
                  {tabData.sentient.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-[#32D74B] mt-1 mr-2" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={tabData.sentient.learnMoreLink}
                  className="inline-flex items-center mt-6 text-primary font-medium"
                >
                  Learn more about Neufin Sentient
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
              <div className="lg:col-span-7">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-lg font-semibold text-neutral-900">
                      Market Sentiment Dashboard
                    </h4>
                    <div className="flex space-x-3">
                      <button className="p-2 text-sm font-medium text-neutral-500 bg-neutral-100 rounded hover:bg-neutral-200">
                        Daily
                      </button>
                      <button className="p-2 text-sm font-medium text-white bg-primary rounded">
                        Weekly
                      </button>
                      <button className="p-2 text-sm font-medium text-neutral-500 bg-neutral-100 rounded hover:bg-neutral-200">
                        Monthly
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {sentimentData.map((item, index) => (
                      <div key={index} className="bg-neutral-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-neutral-500">{item.label}</span>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded bg-sentiment-${item.status}/10 text-sentiment-${item.status}`}
                          >
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-16 h-16 relative">
                            <div
                              className={`w-16 h-16 rounded-full border-4 border-sentiment-${item.status}`}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className={`text-xl font-bold text-sentiment-${item.status}`}
                              >
                                {item.value}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <span
                              className={`text-sm font-medium text-sentiment-${item.status}`}
                            >
                              {item.direction === "up" ? "↑" : "↓"} {item.change}%
                            </span>
                            <p className="text-xs text-neutral-500">from last week</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <h5 className="text-sm font-medium text-neutral-900 mb-3">
                      Sentiment Trend (Last 7 Days)
                    </h5>
                    <div className="h-64 w-full">
                      <SentimentChart />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={activeTab === "nemo" ? "block" : "hidden"}>
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
              <div className="lg:col-span-5 mb-8 lg:mb-0">
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                  {tabData.nemo.title}
                </h3>
                <p className="text-lg text-neutral-600 mb-6">
                  {tabData.nemo.description}
                </p>
                <ul className="space-y-4">
                  {tabData.nemo.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-[#32D74B] mt-1 mr-2" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={tabData.nemo.learnMoreLink}
                  className="inline-flex items-center mt-6 text-primary font-medium"
                >
                  Learn more about Neufin Nemo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
              <div className="lg:col-span-7">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                  {/* Stock analytics dashboard visualization placeholder */}
                  <div className="w-full h-auto bg-neutral-100 rounded-lg aspect-w-16 aspect-h-9">
                    <svg
                      className="w-full h-full text-neutral-400"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 640 512"
                    >
                      <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={activeTab === "o2" ? "block" : "hidden"}>
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
              <div className="lg:col-span-5 mb-8 lg:mb-0">
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                  {tabData.o2.title}
                </h3>
                <p className="text-lg text-neutral-600 mb-6">
                  {tabData.o2.description}
                </p>
                <ul className="space-y-4">
                  {tabData.o2.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-[#32D74B] mt-1 mr-2" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={tabData.o2.learnMoreLink}
                  className="inline-flex items-center mt-6 text-primary font-medium"
                >
                  Learn more about Neufin O2
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
              <div className="lg:col-span-7">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                  {/* AI investment dashboard visualization placeholder */}
                  <div className="w-full h-auto bg-neutral-100 rounded-lg aspect-w-16 aspect-h-9">
                    <svg
                      className="w-full h-full text-neutral-400"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 640 512"
                    >
                      <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={activeTab === "bba" ? "block" : "hidden"}>
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
              <div className="lg:col-span-5 mb-8 lg:mb-0">
                <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                  {tabData.bba.title}
                </h3>
                <p className="text-lg text-neutral-600 mb-6">
                  {tabData.bba.description}
                </p>
                <ul className="space-y-4">
                  {tabData.bba.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-[#32D74B] mt-1 mr-2" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={tabData.bba.learnMoreLink}
                  className="inline-flex items-center mt-6 text-primary font-medium"
                >
                  Learn more about Neufin BBA
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
              <div className="lg:col-span-7">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
                  {/* Behavioral bias dashboard visualization placeholder */}
                  <div className="w-full h-auto bg-neutral-100 rounded-lg aspect-w-16 aspect-h-9">
                    <svg
                      className="w-full h-full text-neutral-400"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      fill="currentColor"
                      viewBox="0 0 640 512"
                    >
                      <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
