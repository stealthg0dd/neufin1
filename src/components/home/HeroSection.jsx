import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="hero-section py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              AI-Driven Financial Insights to Optimize Your Investment Strategy
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Make smarter investment decisions with real-time market sentiment analysis, stock intelligence, and AI-powered recommendations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3 rounded-lg flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/dashboard"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-700 font-bold text-lg px-8 py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                View Demo
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="/public/assets/images/hero-image.png"
              alt="Neufin AI-Powered Financial Intelligence"
              className="rounded-lg shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;