import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Lightbulb, TrendingUp, ChevronsUp, ChevronUp, AlertCircle, Clock, Zap, BarChart2, DollarSign, ArrowUp, ArrowDown, Minus, ArrowUpRight, BarChart3, Lock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Types for investment recommendations
interface InvestmentRecommendation {
  id: number;
  symbol: string;
  name?: string;
  sector?: string;
  recommendation: 'buy' | 'sell' | 'hold';
  timeHorizon: 'short_term' | 'mid_term' | 'long_term';
  confidenceScore: number;
  rationale?: string;
  aiThesis?: string;
  entryPriceLow?: string;
  entryPriceHigh?: string;
  exitPriceLow?: string;
  exitPriceHigh?: string;
  riskRewardRatio?: number;
  volatilityIndex?: number;
  expectedReturn?: number;
  suggestedAllocation?: number;
  sentiment?: 'bullish' | 'neutral' | 'bearish';
  technicalSignal?: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  fundamentalRating?: 'strong' | 'good' | 'fair' | 'weak' | 'poor';
  premium: boolean;
  createdAt: string;
}

// Mock data for demo purposes until we connect to the API
const mockRecommendations: InvestmentRecommendation[] = [
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    recommendation: 'buy',
    timeHorizon: 'mid_term',
    confidenceScore: 82,
    rationale: 'Strong product pipeline and services growth',
    aiThesis: 'Apple continues to demonstrate resilience in its ecosystem with expanding services revenue. The company\'s focus on AI integration across its product line and upcoming AR/VR initiatives position it well for continued growth.',
    entryPriceLow: '170.00',
    entryPriceHigh: '185.00',
    exitPriceLow: '210.00',
    exitPriceHigh: '225.00',
    riskRewardRatio: 2.4,
    volatilityIndex: 4,
    expectedReturn: 22.5,
    suggestedAllocation: 8,
    sentiment: 'bullish',
    technicalSignal: 'buy',
    fundamentalRating: 'strong',
    premium: true,
    createdAt: '2025-01-15T09:30:00Z'
  },
  {
    id: 2,
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Technology',
    recommendation: 'buy',
    timeHorizon: 'long_term',
    confidenceScore: 89,
    rationale: 'AI leadership and datacenter dominance',
    aiThesis: 'NVIDIA maintains its dominant position in AI computing with its cutting-edge GPUs. The company\'s expansion into enterprise AI solutions and continued innovation in chip architecture suggest sustained growth potential.',
    entryPriceLow: '850.00',
    entryPriceHigh: '980.00',
    exitPriceLow: '1250.00', 
    exitPriceHigh: '1400.00',
    riskRewardRatio: 3.1,
    volatilityIndex: 7,
    expectedReturn: 42.8,
    suggestedAllocation: 6,
    sentiment: 'bullish',
    technicalSignal: 'strong_buy',
    fundamentalRating: 'strong',
    premium: true,
    createdAt: '2025-01-18T14:45:00Z'
  },
  {
    id: 3,
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    sector: 'Automotive',
    recommendation: 'hold',
    timeHorizon: 'mid_term',
    confidenceScore: 65,
    rationale: 'Mixed outlook with increasing competition',
    aiThesis: 'Tesla faces intensifying competition in the EV market as traditional automakers accelerate their electric vehicle offerings. While Tesla maintains technological advantages, margin pressures and market saturation concerns warrant caution.',
    entryPriceLow: '175.00',
    entryPriceHigh: '200.00',
    exitPriceLow: '210.00',
    exitPriceHigh: '240.00',
    riskRewardRatio: 1.5,
    volatilityIndex: 8,
    expectedReturn: 12.5,
    suggestedAllocation: 3,
    sentiment: 'neutral',
    technicalSignal: 'neutral',
    fundamentalRating: 'fair',
    premium: true,
    createdAt: '2025-01-20T11:15:00Z'
  },
  {
    id: 4,
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    sector: 'Consumer Cyclical',
    recommendation: 'buy',
    timeHorizon: 'short_term',
    confidenceScore: 78,
    rationale: 'AWS growth and retail stabilization',
    aiThesis: 'Amazon\'s AWS division continues to drive significant growth while the company effectively manages its retail operations. Recent cost-cutting measures have improved margins, and the expansion of high-margin advertising business adds another growth vector.',
    entryPriceLow: '165.00',
    entryPriceHigh: '180.00',
    exitPriceLow: '195.00',
    exitPriceHigh: '210.00',
    riskRewardRatio: 2.0,
    volatilityIndex: 5,
    expectedReturn: 18.9,
    suggestedAllocation: 7,
    sentiment: 'bullish',
    technicalSignal: 'buy',
    fundamentalRating: 'good',
    premium: true,
    createdAt: '2025-01-22T15:30:00Z'
  },
  {
    id: 5,
    symbol: 'XOM',
    name: 'Exxon Mobil Corporation',
    sector: 'Energy',
    recommendation: 'sell',
    timeHorizon: 'long_term',
    confidenceScore: 72,
    rationale: 'Energy transition headwinds',
    aiThesis: 'Despite current strong cash flows, Exxon faces long-term structural challenges as the energy transition accelerates. The company\'s renewable initiatives lag competitors, and regulatory pressures on fossil fuels are expected to increase.',
    entryPriceLow: '110.00',
    entryPriceHigh: '120.00',
    exitPriceLow: '85.00',
    exitPriceHigh: '95.00',
    riskRewardRatio: 1.8,
    volatilityIndex: 6,
    expectedReturn: -18.3,
    suggestedAllocation: 2,
    sentiment: 'bearish',
    technicalSignal: 'sell',
    fundamentalRating: 'weak',
    premium: true,
    createdAt: '2025-01-25T08:45:00Z'
  }
];

export default function InvestmentRecommendations() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedRecommendation, setSelectedRecommendation] = useState<InvestmentRecommendation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'human_readable' | 'data_driven'>('human_readable');
  
  // Fetch recommendations from API
  const { data: recommendations, isLoading, error } = useQuery({
    queryKey: ['/api/o2/recommendations'],
    enabled: false, // Disable the query for now since we're using mock data
  });

  // Use mock data for demonstration
  const recommendationsData = recommendations?.recommendations || mockRecommendations;
  
  // Filter recommendations based on selected tab and search query
  const filteredRecommendations = recommendationsData.filter(rec => {
    const matchesSearch = searchQuery === '' || 
      rec.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.name && rec.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.sector && rec.sector.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'buy') return rec.recommendation === 'buy' && matchesSearch;
    if (selectedTab === 'sell') return rec.recommendation === 'sell' && matchesSearch;
    if (selectedTab === 'hold') return rec.recommendation === 'hold' && matchesSearch;
    if (selectedTab === 'short_term') return rec.timeHorizon === 'short_term' && matchesSearch;
    if (selectedTab === 'mid_term') return rec.timeHorizon === 'mid_term' && matchesSearch;
    if (selectedTab === 'long_term') return rec.timeHorizon === 'long_term' && matchesSearch;
    
    return matchesSearch;
  });
  
  // Generate natural language query to get recommendations
  const handleNaturalLanguageQuery = async () => {
    if (!searchQuery) return;
    
    try {
      // This would be connected to the actual API endpoint in production
      // const response = await apiRequest('/api/o2/recommendations/query', {
      //   method: 'POST',
      //   body: JSON.stringify({ query: searchQuery }),
      // });
      
      // For now, just filter the mock data based on the search query
      const processedQuery = searchQuery.toLowerCase();
      // Additional processing would happen in the backend
      
      // Show an alert for now
      alert(`Processed query: "${searchQuery}"\n\nThis feature would call the natural language processing API in production.`);
    } catch (error) {
      console.error('Error processing natural language query:', error);
    }
  };
  
  // Generate a recommendation
  const generateRecommendation = async (symbol: string) => {
    try {
      // This would be connected to the actual API endpoint in production
      // const response = await apiRequest('/api/o2/recommendations/generate', {
      //   method: 'POST',
      //   body: JSON.stringify({ 
      //     symbol,
      //     preferences: {
      //       riskTolerance: 'medium',
      //       investmentHorizon: 'medium',
      //     }
      //   }),
      // });
      
      // For now, just show an alert
      alert(`Generating recommendation for ${symbol}...\n\nThis feature would call the AI recommendation generation API in production.`);
    } catch (error) {
      console.error('Error generating recommendation:', error);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Lightbulb className="mr-2 h-8 w-8 text-blue-600" /> 
            Neufin O2 AI Recommendations
          </h1>
          <p className="text-gray-600 mt-2">
            Artificial intelligence-powered investment recommendations tailored to your preferences.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col md:items-end">
          <div className="flex space-x-2 mb-2">
            <Input 
              placeholder="Search or ask a question..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-48 md:w-64"
            />
            <Button variant="outline" onClick={handleNaturalLanguageQuery}>
              <Zap className="h-4 w-4 mr-1" /> Search
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            Try: "Best tech stocks for the next quarter" or "AAPL"
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <TabsList className="mb-4 md:mb-0">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="hold">Hold</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
            <TabsTrigger value="short_term">Short-Term</TabsTrigger>
            <TabsTrigger value="mid_term">Mid-Term</TabsTrigger>
            <TabsTrigger value="long_term">Long-Term</TabsTrigger>
          </TabsList>
          
          <div className="flex">
            <Button 
              variant={viewMode === 'human_readable' ? 'default' : 'outline'} 
              size="sm" 
              className="mr-2"
              onClick={() => setViewMode('human_readable')}
            >
              Human Readable
            </Button>
            <Button 
              variant={viewMode === 'data_driven' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('data_driven')}
            >
              Data-Driven
            </Button>
          </div>
        </div>
      
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map(recommendation => (
              <RecommendationCard 
                key={recommendation.id} 
                recommendation={recommendation}
                onClick={() => setSelectedRecommendation(recommendation)}
                viewMode={viewMode}
              />
            ))}
          </div>
        </TabsContent>
        
        {['buy', 'hold', 'sell', 'short_term', 'mid_term', 'long_term'].map(tabValue => (
          <TabsContent key={tabValue} value={tabValue} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map(recommendation => (
                <RecommendationCard 
                  key={recommendation.id} 
                  recommendation={recommendation}
                  onClick={() => setSelectedRecommendation(recommendation)}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {filteredRecommendations.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No recommendations found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your filters or search query, or generate a new recommendation.
          </p>
          <Button className="mt-4" onClick={() => generateRecommendation('AAPL')}>
            Generate New Recommendation
          </Button>
        </div>
      )}
      
      {selectedRecommendation && (
        <DetailedRecommendationModal 
          recommendation={selectedRecommendation}
          onClose={() => setSelectedRecommendation(null)}
          viewMode={viewMode}
        />
      )}
      
      {/* Statistics and Metrics Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <BarChart2 className="mr-2 h-6 w-6 text-blue-600" />
          Recommendation Insights
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution by Recommendation Type */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Distribution</CardTitle>
              <CardDescription>Breakdown of AI recommendations by type</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Buy', value: recommendationsData.filter(r => r.recommendation === 'buy').length, color: '#22c55e' },
                      { name: 'Hold', value: recommendationsData.filter(r => r.recommendation === 'hold').length, color: '#f59e0b' },
                      { name: 'Sell', value: recommendationsData.filter(r => r.recommendation === 'sell').length, color: '#ef4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {recommendationsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.recommendation === 'buy' ? '#22c55e' :
                        entry.recommendation === 'hold' ? '#f59e0b' : '#ef4444'
                      } />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Expected Returns by Sector */}
          <Card>
            <CardHeader>
              <CardTitle>Expected Returns by Sector</CardTitle>
              <CardDescription>Average expected returns for each sector</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { sector: 'Technology', return: 32.65 },
                    { sector: 'Consumer', return: 18.9 },
                    { sector: 'Healthcare', return: 21.3 },
                    { sector: 'Finance', return: 15.7 },
                    { sector: 'Energy', return: -18.3 }
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sector" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Expected Return']} />
                  <Bar dataKey="return" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Natural Language Query Advanced Section */}
      <Card className="mt-8 border-dashed border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2 text-blue-600" />
            Premium Feature: AI Investment Assistant
          </CardTitle>
          <CardDescription>
            Ask complex investment questions in natural language and get AI-powered answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-700 mb-4">
              Example queries:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Badge variant="outline" className="justify-center cursor-pointer hover:bg-blue-100">
                "Best low-risk dividend stocks"
              </Badge>
              <Badge variant="outline" className="justify-center cursor-pointer hover:bg-blue-100">
                "Technology stocks with high growth potential"
              </Badge>
              <Badge variant="outline" className="justify-center cursor-pointer hover:bg-blue-100">
                "Companies focused on renewable energy"
              </Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Learn More</Button>
          <Button>Unlock Premium</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Card component for displaying a recommendation
function RecommendationCard({ 
  recommendation, 
  onClick,
  viewMode
}: { 
  recommendation: InvestmentRecommendation; 
  onClick: () => void;
  viewMode: 'human_readable' | 'data_driven';
}) {
  const getRecommendationColor = (rec: string) => {
    switch(rec) {
      case 'buy': return 'bg-green-100 text-green-800';
      case 'sell': return 'bg-red-100 text-red-800';
      case 'hold': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTimeHorizonLabel = (horizon: string) => {
    switch(horizon) {
      case 'short_term': return 'Short-Term (1 week - 1 month)';
      case 'mid_term': return 'Mid-Term (1 - 6 months)';
      case 'long_term': return 'Long-Term (6+ months)';
      default: return horizon;
    }
  };
  
  const getRecommendationIcon = (rec: string) => {
    switch(rec) {
      case 'buy': return <ArrowUp className="h-4 w-4 mr-1 text-green-600" />;
      case 'sell': return <ArrowDown className="h-4 w-4 mr-1 text-red-600" />;
      case 'hold': return <Minus className="h-4 w-4 mr-1 text-amber-600" />;
      default: return null;
    }
  };
  
  const getSentimentIcon = (sentiment?: string) => {
    if (!sentiment) return null;
    
    switch(sentiment) {
      case 'bullish': return <ChevronsUp className="h-4 w-4 mr-1 text-green-600" />;
      case 'bearish': return <ArrowDown className="h-4 w-4 mr-1 text-red-600" />;
      case 'neutral': return <Minus className="h-4 w-4 mr-1 text-amber-600" />;
      default: return null;
    }
  };
  
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {recommendation.symbol}
              {recommendation.premium && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0 h-5 text-xs">
                  <Lock className="h-3 w-3 mr-1" /> Premium
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {recommendation.name} {recommendation.sector && `• ${recommendation.sector}`}
            </CardDescription>
          </div>
          <Badge className={`${getRecommendationColor(recommendation.recommendation)} flex items-center`}>
            {getRecommendationIcon(recommendation.recommendation)}
            {recommendation.recommendation.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {viewMode === 'human_readable' ? (
          <div>
            <p className="text-sm font-medium">{recommendation.rationale}</p>
            
            <div className="mt-3 flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              {getTimeHorizonLabel(recommendation.timeHorizon)}
            </div>
            
            {recommendation.expectedReturn !== undefined && (
              <div className="flex items-center mt-1 text-sm">
                <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
                <span>Expected Return: </span>
                <span className={recommendation.expectedReturn >= 0 ? 'text-green-600 font-medium ml-1' : 'text-red-600 font-medium ml-1'}>
                  {recommendation.expectedReturn >= 0 ? '+' : ''}{recommendation.expectedReturn}%
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-gray-500">Time Horizon</div>
                <div className="font-medium">{recommendation.timeHorizon.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-gray-500">Confidence</div>
                <div className="font-medium">{recommendation.confidenceScore}/100</div>
              </div>
              <div>
                <div className="text-gray-500">Return</div>
                <div className={`font-medium ${recommendation.expectedReturn && recommendation.expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {recommendation.expectedReturn ? `${recommendation.expectedReturn >= 0 ? '+' : ''}${recommendation.expectedReturn}%` : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">Risk/Reward</div>
                <div className="font-medium">{recommendation.riskRewardRatio || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          {recommendation.sentiment && (
            <Badge variant="outline" className="mr-2 text-xs px-1.5 py-0 h-5 flex items-center">
              {getSentimentIcon(recommendation.sentiment)}
              {recommendation.sentiment}
            </Badge>
          )}
        </div>
        
        <div>
          {new Date(recommendation.createdAt).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
}

// Modal component for displaying detailed recommendation information
function DetailedRecommendationModal({ 
  recommendation, 
  onClose,
  viewMode
}: { 
  recommendation: InvestmentRecommendation; 
  onClose: () => void;
  viewMode: 'human_readable' | 'data_driven';
}) {
  const getRecommendationColor = (rec: string) => {
    switch(rec) {
      case 'buy': return 'bg-green-100 text-green-800';
      case 'sell': return 'bg-red-100 text-red-800';
      case 'hold': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getRecommendationIcon = (rec: string) => {
    switch(rec) {
      case 'buy': return <ArrowUp className="h-5 w-5 mr-1 text-green-600" />;
      case 'sell': return <ArrowDown className="h-5 w-5 mr-1 text-red-600" />;
      case 'hold': return <Minus className="h-5 w-5 mr-1 text-amber-600" />;
      default: return null;
    }
  };
  
  const getTimeHorizonLabel = (horizon: string) => {
    switch(horizon) {
      case 'short_term': return 'Short-Term (1 week - 1 month)';
      case 'mid_term': return 'Mid-Term (1 - 6 months)';
      case 'long_term': return 'Long-Term (6+ months)';
      default: return horizon;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              {recommendation.symbol} 
              <span className="text-gray-500 ml-2 font-normal">{recommendation.name}</span>
              {recommendation.premium && (
                <Badge variant="secondary" className="ml-3">
                  <Lock className="h-3 w-3 mr-1" /> Premium
                </Badge>
              )}
            </h2>
            <p className="text-gray-600">
              {recommendation.sector} • Last updated: {new Date(recommendation.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <Badge className={`${getRecommendationColor(recommendation.recommendation)} flex items-center text-base px-3 py-1`}>
            {getRecommendationIcon(recommendation.recommendation)}
            {recommendation.recommendation.toUpperCase()}
          </Badge>
        </div>
        
        <div className="p-6">
          {/* Key Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-l-4 border-blue-500">
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Confidence Score</div>
                <div className="mt-1 flex items-end">
                  <span className="text-2xl font-bold">{recommendation.confidenceScore}</span>
                  <span className="text-sm text-gray-500 ml-1">/100</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-indigo-500">
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Time Horizon</div>
                <div className="mt-1 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                  <span className="text-lg font-medium">
                    {getTimeHorizonLabel(recommendation.timeHorizon)}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`border-l-4 ${recommendation.expectedReturn && recommendation.expectedReturn >= 0 ? 'border-green-500' : 'border-red-500'}`}>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Expected Return</div>
                <div className="mt-1 flex items-center">
                  <TrendingUp className={`h-5 w-5 mr-2 ${recommendation.expectedReturn && recommendation.expectedReturn >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-2xl font-bold ${recommendation.expectedReturn && recommendation.expectedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {recommendation.expectedReturn ? `${recommendation.expectedReturn >= 0 ? '+' : ''}${recommendation.expectedReturn}%` : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {viewMode === 'human_readable' ? (
            <>
              {/* Investment Thesis */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                  Investment Thesis
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {recommendation.aiThesis || 'No detailed thesis available.'}
                </p>
              </div>
              
              {/* Rationale */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Rationale</h3>
                <p className="text-gray-700">
                  {recommendation.rationale || 'No rationale provided.'}
                </p>
              </div>
              
              {/* Entry & Exit Points */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <ArrowUpRight className="h-5 w-5 mr-2 text-blue-600" />
                  Entry & Exit Points
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-md">
                    <h4 className="font-medium text-green-800 mb-1">Entry Price Range</h4>
                    <p className="text-2xl font-bold text-green-700">
                      {recommendation.entryPriceLow && recommendation.entryPriceHigh ? 
                        `$${recommendation.entryPriceLow} - $${recommendation.entryPriceHigh}` : 
                        'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-1">Exit Price Range</h4>
                    <p className="text-2xl font-bold text-blue-700">
                      {recommendation.exitPriceLow && recommendation.exitPriceHigh ? 
                        `$${recommendation.exitPriceLow} - $${recommendation.exitPriceHigh}` : 
                        'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Investment Metrics</h3>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Risk/Reward Ratio</td>
                      <td className="py-2 font-medium text-right">{recommendation.riskRewardRatio || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Volatility Index</td>
                      <td className="py-2 font-medium text-right">{recommendation.volatilityIndex ? `${recommendation.volatilityIndex}/10` : 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Suggested Allocation</td>
                      <td className="py-2 font-medium text-right">{recommendation.suggestedAllocation ? `${recommendation.suggestedAllocation}%` : 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Technical Signal</td>
                      <td className="py-2 font-medium text-right">{recommendation.technicalSignal?.replace('_', ' ') || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Fundamental Rating</td>
                      <td className="py-2 font-medium text-right">{recommendation.fundamentalRating || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Market Sentiment</td>
                      <td className="py-2 font-medium text-right">{recommendation.sentiment || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Price Targets</h3>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Entry Price (Low)</td>
                      <td className="py-2 font-medium text-right">${recommendation.entryPriceLow || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Entry Price (High)</td>
                      <td className="py-2 font-medium text-right">${recommendation.entryPriceHigh || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-gray-600">Exit Price (Low)</td>
                      <td className="py-2 font-medium text-right">${recommendation.exitPriceLow || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Exit Price (High)</td>
                      <td className="py-2 font-medium text-right">${recommendation.exitPriceHigh || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Analysis</h3>
                  <Alert className="bg-blue-50">
                    <AlertDescription className="text-sm">{recommendation.rationale || 'No analysis available.'}</AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          )}
          
          {/* Additional Analysis and Metrics Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
              Additional Metrics
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Risk/Reward</div>
                  <div className="font-medium">{recommendation.riskRewardRatio || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Volatility</div>
                  <div className="font-medium">{recommendation.volatilityIndex ? `${recommendation.volatilityIndex}/10` : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Suggested Allocation</div>
                  <div className="font-medium">{recommendation.suggestedAllocation ? `${recommendation.suggestedAllocation}%` : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Technical Signal</div>
                  <div className="font-medium">{recommendation.technicalSignal?.replace('_', ' ') || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}