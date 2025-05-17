import React from 'react';
import { Helmet } from 'react-helmet';
import HeroSection from '../components/home/HeroSection';
import ProductsSection from '../components/home/ProductsSection';
import PricingSection from '../components/home/PricingSection';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Neufin | AI-Powered Financial Intelligence Platform</title>
        <meta name="description" content="Neufin offers AI-powered financial intelligence with real-time market sentiment analysis, stock intelligence, personalized investment recommendations, and behavioral bias analysis." />
      </Helmet>
      
      <div className="animate-fade-in">
        <HeroSection />
        <ProductsSection />
        
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Neufin?</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our platform combines the latest in artificial intelligence with deep financial expertise to give you an edge in the market.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Secure & Reliable</h3>
                  <p className="text-gray-600">
                    Bank-level security with encrypted data storage and reliable uptime to ensure your financial data is always safe and accessible.
                  </p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Real-Time Updates</h3>
                  <p className="text-gray-600">
                    Get instant market updates, sentiment analysis, and recommendations as market conditions change throughout the day.
                  </p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Customizable</h3>
                  <p className="text-gray-600">
                    Tailor the platform to your investment style, risk tolerance, and financial goals for a personalized experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <PricingSection />
        
        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Hear from investors who have transformed their strategy with Neufin's AI-powered insights.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">JD</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold">John Doe</h4>
                    <p className="text-sm text-gray-500">Individual Investor</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Neufin's sentiment analysis helped me avoid several market downturns. The platform has dramatically improved my investment returns in just three months."
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 font-bold">MS</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold">Maria Smith</h4>
                    <p className="text-sm text-gray-500">Portfolio Manager</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The behavioral bias analyzer has been eye-opening. I didn't realize how emotions were affecting my trading decisions until Neufin highlighted the patterns."
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-bold">RJ</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold">Robert Johnson</h4>
                    <p className="text-sm text-gray-500">Day Trader</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Neufin O2's AI recommendations have been spot on. The platform's technical analysis tools and real-time data feed give me the edge I need in fast-moving markets."
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Investment Strategy?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Start your 14-day free trial today and experience the power of AI-driven financial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a 
                href="/register" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 py-3 rounded-lg transition-colors"
              >
                Start Free Trial
              </a>
              <a 
                href="/contact" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold px-8 py-3 rounded-lg transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;