import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-3">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            The science behind our platform
          </h2>
          <p className="mt-4 text-xl text-neutral-600 max-w-3xl mx-auto">
            See how our AI-powered platform transforms financial data into actionable insights
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="lg:col-span-5 mb-12 lg:mb-0">
            <div className="space-y-10">
              <div className="relative pl-12">
                <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Data Collection & Processing
                </h3>
                <p className="text-neutral-600">
                  Our system continuously collects vast amounts of financial data from markets,
                  news, social media, and company reports.
                </p>
              </div>

              <div className="relative pl-12">
                <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  AI Analysis & Pattern Recognition
                </h3>
                <p className="text-neutral-600">
                  Advanced AI models process and analyze the data, identifying patterns, trends,
                  and anomalies.
                </p>
              </div>

              <div className="relative pl-12">
                <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Personalized Insights
                </h3>
                <p className="text-neutral-600">
                  The platform generates tailored insights and recommendations based on your
                  specific goals and preferences.
                </p>
              </div>

              <div className="relative pl-12">
                <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  4
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Continuous Learning
                </h3>
                <p className="text-neutral-600">
                  Our system continuously learns and adapts based on new data and feedback,
                  improving accuracy over time.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {/* Modern fintech data visualization */}
            <div className="rounded-xl bg-neutral-50 overflow-hidden p-6">
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <div className="w-full h-full rounded-lg shadow-lg bg-neutral-200 flex items-center justify-center">
                  <svg
                    className="w-1/2 h-1/2 text-neutral-400"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 640 512"
                  >
                    <path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-center mt-4">
                <Button className="bg-primary hover:bg-primary-dark transition-colors">
                  <Play className="mr-2 h-4 w-4" /> Watch how it works
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
