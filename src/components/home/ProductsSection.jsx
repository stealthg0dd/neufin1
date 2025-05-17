import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Brain, Scale, ExternalLink } from 'lucide-react';

const ProductsSection = () => {
  const products = [
    {
      id: 'sentient',
      name: 'Neufin Sentient',
      description: 'Real-time market sentiment analysis for informed trading decisions. Track social media, news, and analyst opinions for comprehensive market insights.',
      icon: <BarChart3 className="h-12 w-12 text-blue-600" />,
      link: '/sentiment-analysis',
      color: 'bg-blue-50'
    },
    {
      id: 'nemo',
      name: 'Neufin Nemo',
      description: 'Advanced stock intelligence suite with technical analysis, fundamental data, and AI-powered pattern recognition for better market visualization.',
      icon: <TrendingUp className="h-12 w-12 text-green-600" />,
      link: '/stock-analysis',
      color: 'bg-green-50'
    },
    {
      id: 'o2',
      name: 'Neufin O2',
      description: 'AI-powered investment recommendations tailored to your risk profile, financial goals, and market conditions for optimal portfolio allocation.',
      icon: <Brain className="h-12 w-12 text-purple-600" />,
      link: '/investment-recommendations',
      color: 'bg-purple-50'
    },
    {
      id: 'bba',
      name: 'Neufin BBA',
      description: 'Behavioral Bias Analyzer identifies and mitigates emotional trading patterns to improve decision-making and investment outcomes.',
      icon: <Scale className="h-12 w-12 text-orange-600" />,
      link: '/behavioral-bias-analyzer',
      color: 'bg-orange-50'
    }
  ];

  return (
    <section className="py-20 bg-gray-50" id="products">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Intelligent Modules</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Neufin combines multiple specialized modules to provide a comprehensive financial intelligence platform that enhances your investment strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              className={`product-card ${product.color} rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl`}
            >
              <div className="p-8">
                <div className="mb-6">
                  {product.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{product.name}</h3>
                <p className="text-gray-600 mb-6">
                  {product.description}
                </p>
                <Link 
                  to={product.link}
                  className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
                >
                  Learn more <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;