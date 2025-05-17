import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart, 
  PieChart, 
  AlertTriangle, 
  Bell, 
  Brain, 
  Lightbulb, 
  RefreshCw,
  MessageSquare,
  ExternalLink,
  BarChart2,
  BarChart3
} from "lucide-react";
import { useMarketOverview, RealTimeQuote } from "@/hooks/useMarketData";

// Demo user ID for development
const DEMO_USER_ID = 1;

// Type for portfolio summary
interface PortfolioSummary {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  holdings: {
    symbol: string;
    name: string;
    shares: number;
    value: number;
    change: number;
    changePercent: number;
  }[];
}

// Type for sentiment summary
interface SentimentSummary {
  overall: {
    score: number;
    status: "bullish" | "bearish" | "neutral";
    trend: "improving" | "worsening" | "stable";
    change: number;
  };
  symbols: {
    symbol: string;
    score: number;
    status: "bullish" | "bearish" | "neutral";
    trend: "improving" | "worsening" | "stable";
  }[];
}

// Type for recommendation summary
interface RecommendationSummary {
  actions: {
    id: number;
    type: "buy" | "sell" | "hold" | "research";
    symbol: string;
    name: string;
    confidence: number;
    reasoning: string;
    timeHorizon: string;
  }[];
  insights: {
    id: number;
    title: string;
    content: string;
    relevance: number;
  }[];
}

// Type for bias analysis summary
interface BiasSummary {
  score: number;
  primaryBiases: {
    biasType: string;
    score: number;
    trend: "improving" | "worsening" | "stable";
  }[];
  recentTrades: {
    id: number;
    action: "buy" | "sell";
    symbol: string;
    date: string;
    quantity: number;
    price: number;
    potentialBiases: string[];
  }[];
  nudges: {
    id: number;
    message: string;
    importance: "high" | "medium" | "low";
  }[];
}

const Dashboard = () => {
  const { toast } = useToast();
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Market data
  const { data: marketOverview, isLoading: isMarketLoading } = useMarketOverview();
  
  // Portfolio data
  const { data: portfolio, isLoading: isPortfolioLoading } = useQuery({
    queryKey: ['/api/portfolio/summary', DEMO_USER_ID],
    queryFn: async () => {
      // For demo purposes we'll create sample data
      // Replace with actual API call:
      // return await apiRequest<PortfolioSummary>(\`/api/portfolio/summary/${DEMO_USER_ID}\`);
      
      return {
        totalValue: 156732.45,
        dailyChange: -1243.67,
        dailyChangePercent: -0.78,
        holdings: [
          { symbol: "AAPL", name: "Apple Inc.", shares: 50, value: 8750.50, change: 125.50, changePercent: 1.45 },
          { symbol: "MSFT", name: "Microsoft Corp.", shares: 30, value: 9843.60, change: -137.40, changePercent: -1.38 },
          { symbol: "AMZN", name: "Amazon.com Inc.", shares: 15, value: 4650.75, change: 78.30, changePercent: 1.71 },
          { symbol: "GOOGL", name: "Alphabet Inc.", shares: 20, value: 5346.00, change: -98.40, changePercent: -1.81 },
          { symbol: "META", name: "Meta Platforms Inc.", shares: 25, value: 6875.25, change: 218.25, changePercent: 3.28 }
        ]
      } as PortfolioSummary;
    }
  });
  
  // Sentiment data
  const { data: sentiment, isLoading: isSentimentLoading } = useQuery({
    queryKey: ['/api/sentiment/summary'],
    queryFn: async () => {
      // For demo purposes we'll create sample data
      // Replace with actual API call:
      // return await apiRequest<SentimentSummary>('/api/sentiment/summary');
      
      return {
        overall: {
          score: 62.5,
          status: "bullish",
          trend: "improving",
          change: 3.8
        },
        symbols: [
          { symbol: "SPY", score: 63.2, status: "bullish", trend: "improving" },
          { symbol: "QQQ", score: 68.7, status: "bullish", trend: "improving" },
          { symbol: "AAPL", score: 71.5, status: "bullish", trend: "stable" },
          { symbol: "MSFT", score: 58.3, status: "neutral", trend: "worsening" },
          { symbol: "AMZN", score: 65.9, status: "bullish", trend: "improving" }
        ]
      } as SentimentSummary;
    }
  });
  
  // Recommendations data
  const { data: recommendations, isLoading: isRecommendationsLoading } = useQuery({
    queryKey: ['/api/recommendations/summary', DEMO_USER_ID],
    queryFn: async () => {
      // For demo purposes we'll create sample data
      // Replace with actual API call:
      // return await apiRequest<RecommendationSummary>(\`/api/recommendations/summary/${DEMO_USER_ID}\`);
      
      return {
        actions: [
          { id: 1, type: "buy", symbol: "NVDA", name: "NVIDIA Corporation", confidence: 0.85, reasoning: "Strong AI demand and market position", timeHorizon: "mid_term" },
          { id: 2, type: "sell", symbol: "IBM", name: "IBM Corporation", confidence: 0.72, reasoning: "Declining growth indicators", timeHorizon: "short_term" },
          { id: 3, type: "research", symbol: "TSLA", name: "Tesla, Inc.", confidence: 0.67, reasoning: "Potential volatility ahead", timeHorizon: "short_term" },
          { id: 4, type: "hold", symbol: "AMZN", name: "Amazon.com Inc.", confidence: 0.91, reasoning: "Strong fundamentals despite recent dip", timeHorizon: "long_term" }
        ],
        insights: [
          { id: 1, title: "Tech Sector Rotation", content: "Evidence suggests rotation from established tech to emerging tech companies.", relevance: 0.88 },
          { id: 2, title: "Interest Rate Impact", content: "Recent Fed statements indicate potential for two more rate hikes.", relevance: 0.92 },
          { id: 3, title: "AI Spending Surge", content: "Enterprise AI investment growing 34% YoY, accelerating in Q2.", relevance: 0.79 }
        ]
      } as RecommendationSummary;
    }
  });
  
  // Bias analysis data
  const { data: biasAnalysis, isLoading: isBiasLoading } = useQuery({
    queryKey: ['/api/bba/summary', DEMO_USER_ID],
    queryFn: async () => {
      // For demo purposes we'll create sample data
      // Replace with actual API call:
      // return await apiRequest<BiasSummary>(\`/api/bba/summary/${DEMO_USER_ID}\`);
      
      return {
        score: 38,
        primaryBiases: [
          { biasType: "Recency Bias", score: 68, trend: "improving" },
          { biasType: "Loss Aversion", score: 72, trend: "worsening" },
          { biasType: "Confirmation Bias", score: 45, trend: "stable" }
        ],
        recentTrades: [
          { id: 1, action: "buy", symbol: "AAPL", date: "2025-05-15", quantity: 5, price: 189.84, potentialBiases: ["Recency Bias"] },
          { id: 2, action: "sell", symbol: "META", date: "2025-05-14", quantity: 10, price: 487.92, potentialBiases: ["Loss Aversion"] },
          { id: 3, action: "buy", symbol: "GOOGL", date: "2025-05-12", quantity: 3, price: 176.44, potentialBiases: [] }
        ],
        nudges: [
          { id: 1, message: "Consider diversifying beyond tech stocks", importance: "medium" },
          { id: 2, message: "Your trading frequency has increased 35% this month", importance: "low" },
          { id: 3, message: "You tend to sell winners too early", importance: "high" }
        ]
      } as BiasSummary;
    }
  });
  
  // User data (demo)
  const userData = {
    name: "Alex Rivera",
    subscriptionTier: "Premium",
    lastLogin: "2025-05-16T09:32:15Z",
    profileComplete: 85
  };
  
  // Daily quote
  const dailyQuote = {
    text: "The market can remain irrational longer than you can remain solvent.",
    author: "John Maynard Keynes"
  };
  
  // AI Assistant handler
  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    
    setIsAiLoading(true);
    try {
      // Simulate AI response - replace with actual API call
      // const response = await apiRequest<{answer: string}>('/api/assistant/query', 'POST', { query: aiQuery });
      
      // Simulated response
      setTimeout(() => {
        setAiResponse(`Based on your portfolio and current market conditions, ${aiQuery.includes("recommend") ? "I recommend focusing on diversification, especially in non-tech sectors. Your current allocation is 72% technology which increases volatility risk." : "the current market sentiment is cautiously optimistic with the VIX showing decreased volatility. Consider your time horizon before making significant changes."}`);
        setIsAiLoading(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "AI Assistant Error",
        description: "Could not process your query. Please try again.",
        variant: "destructive"
      });
      setIsAiLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  };

  // Generate a sentiment color based on score
  const getSentimentColor = (score: number) => {
    if (score >= 60) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };
  
  // Generate a sentiment status icon
  const getSentimentIcon = (status: "bullish" | "bearish" | "neutral") => {
    switch (status) {
      case "bullish": return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "bearish": return <TrendingDown className="h-5 w-5 text-red-500" />;
      case "neutral": return <BarChart className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-screen-2xl">
      {/* Notifications banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Bell className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-sm text-blue-800">
            <span className="font-medium">Market Alert:</span> Fed meeting minutes released at 2:00 PM EST may impact market volatility.
          </span>
        </div>
        <Button variant="ghost" size="sm">Dismiss</Button>
      </div>
      
      {/* User greeting */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userData.name}</h1>
          <p className="text-muted-foreground mt-1">
            <span className="italic">"{dailyQuote.text}"</span> — {dailyQuote.author}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mr-3">
            {userData.subscriptionTier}
          </div>
          <Button variant="outline" size="sm" className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Dashboard
          </Button>
        </div>
      </div>
      
      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Market Sentiment Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-500" />
              Market Sentiment
            </CardTitle>
            <CardDescription>Neufin Sentient Analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {isSentimentLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : sentiment ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getSentimentIcon(sentiment.overall.status)}
                    <span className="ml-2 font-medium">
                      {sentiment.overall.status.charAt(0).toUpperCase() + sentiment.overall.status.slice(1)}
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${getSentimentColor(sentiment.overall.score)}`}>
                    {sentiment.overall.score}
                  </div>
                </div>
                <Progress
                  value={sentiment.overall.score}
                  className="h-3 mb-4"
                />
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className={sentiment.overall.change > 0 ? "text-green-500" : "text-red-500"}>
                    {sentiment.overall.change > 0 ? "+" : ""}{sentiment.overall.change}%
                  </span>
                  <span className="mx-2">•</span>
                  <span>{sentiment.overall.trend}</span>
                </div>
                <Separator className="my-3" />
                <div className="text-sm">
                  <div className="font-medium mb-1">Top symbols</div>
                  <ul className="space-y-1">
                    {sentiment.symbols.slice(0, 3).map(symbol => (
                      <li key={symbol.symbol} className="flex items-center justify-between">
                        <span>{symbol.symbol}</span>
                        <span className={getSentimentColor(symbol.score)}>{symbol.score}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-purple-500">
                  View full sentiment report
                </Button>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                No sentiment data available
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Portfolio Overview Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-blue-500" />
              Portfolio Summary
            </CardTitle>
            <CardDescription>Neufin Nemo Analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {isPortfolioLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : portfolio ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-lg font-bold">{formatCurrency(portfolio.totalValue)}</div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">Daily Change</div>
                  <div className={`font-medium ${portfolio.dailyChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {portfolio.dailyChange > 0 ? '+' : ''}{formatCurrency(portfolio.dailyChange)} 
                    ({portfolio.dailyChangePercent > 0 ? '+' : ''}{portfolio.dailyChangePercent.toFixed(2)}%)
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="text-sm">
                  <div className="font-medium mb-1">Top holdings</div>
                  <ul className="space-y-1">
                    {portfolio.holdings.slice(0, 3).map(holding => (
                      <li key={holding.symbol} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span>{holding.symbol}</span>
                          <span className="text-xs text-muted-foreground ml-1">({holding.shares} shares)</span>
                        </div>
                        <span className={holding.change > 0 ? 'text-green-500' : 'text-red-500'}>
                          {holding.change > 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-blue-500">
                  View full portfolio
                </Button>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                No portfolio data available
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* AI Recommendations Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>Neufin O2 Analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {isRecommendationsLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : recommendations ? (
              <div>
                <div className="text-sm mb-2 font-medium">Recommended Actions</div>
                <ul className="space-y-2 mb-3">
                  {recommendations.actions.slice(0, 2).map(action => (
                    <li key={action.id} className="bg-amber-50 p-2 rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <span className="text-xs font-semibold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded uppercase mr-2">
                            {action.type}
                          </span>
                          <span className="font-medium">{action.symbol}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{action.timeHorizon.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{action.reasoning}</p>
                    </li>
                  ))}
                </ul>
                <div className="text-sm">
                  <div className="font-medium mb-1">Key Insight</div>
                  <p className="text-xs text-muted-foreground bg-gray-50 p-2 rounded-md">
                    {recommendations.insights[0].content}
                  </p>
                </div>
                <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-amber-500">
                  View all recommendations
                </Button>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                No recommendation data available
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Behavioral Bias Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-green-500" />
              Bias Analysis
            </CardTitle>
            <CardDescription>Neufin BBA Analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {isBiasLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : biasAnalysis ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">Overall Bias Score</div>
                  <div className="text-lg font-bold">
                    {biasAnalysis.score}<span className="text-xs text-muted-foreground ml-1">/100</span>
                  </div>
                </div>
                <div className="mb-3">
                  <Progress
                    value={biasAnalysis.score}
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Lower is better</span>
                    <span>{biasAnalysis.score < 30 ? 'Excellent' : biasAnalysis.score < 50 ? 'Good' : biasAnalysis.score < 70 ? 'Needs attention' : 'High bias'}</span>
                  </div>
                </div>
                <div className="text-sm mb-2">
                  <div className="font-medium mb-1">Primary Biases</div>
                  {biasAnalysis.primaryBiases.slice(0, 2).map(bias => (
                    <div key={bias.biasType} className="flex items-center justify-between mb-1">
                      <span>{bias.biasType}</span>
                      <span className={bias.trend === 'improving' ? 'text-green-500' : bias.trend === 'worsening' ? 'text-red-500' : 'text-yellow-500'}>
                        {bias.trend}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 border-l-4 border-green-400 p-2 text-xs text-green-800 rounded-sm mt-2">
                  {biasAnalysis.nudges[0].message}
                </div>
                <Button variant="link" size="sm" className="mt-2 p-0 h-auto text-green-500">
                  View bias report
                </Button>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                No bias analysis data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Market overview section */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
              Market Overview
            </CardTitle>
            <CardDescription>Real-time market data and indices</CardDescription>
          </CardHeader>
          <CardContent>
            {isMarketLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : marketOverview ? (
              <div>
                <Tabs defaultValue="indices">
                  <TabsList className="mb-4">
                    <TabsTrigger value="indices">Indices</TabsTrigger>
                    <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
                    <TabsTrigger value="losers">Top Losers</TabsTrigger>
                    <TabsTrigger value="active">Most Active</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="indices">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {marketOverview.marketIndices.map((index: RealTimeQuote) => (
                        <Card key={index.symbol} className="bg-gray-50 border-0">
                          <CardContent className="p-4">
                            <div className="font-medium">{index.symbol}</div>
                            <div className="text-xl font-bold mt-1">{index.price.toFixed(2)}</div>
                            <div className={`flex items-center text-sm ${index.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {index.change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                              {index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="gainers">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {marketOverview.topGainers.map((stock: RealTimeQuote) => (
                        <Card key={stock.symbol} className="bg-green-50 border-0">
                          <CardContent className="p-4">
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-xl font-bold mt-1">{stock.price.toFixed(2)}</div>
                            <div className="flex items-center text-sm text-green-500">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="losers">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {marketOverview.topLosers.map((stock: RealTimeQuote) => (
                        <Card key={stock.symbol} className="bg-red-50 border-0">
                          <CardContent className="p-4">
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-xl font-bold mt-1">{stock.price.toFixed(2)}</div>
                            <div className="flex items-center text-sm text-red-500">
                              <TrendingDown className="h-4 w-4 mr-1" />
                              {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="active">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {marketOverview.mostActive.map((stock: RealTimeQuote) => (
                        <Card key={stock.symbol} className="bg-blue-50 border-0">
                          <CardContent className="p-4">
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-xl font-bold mt-1">{stock.price.toFixed(2)}</div>
                            <div className={`flex items-center text-sm ${stock.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {stock.change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                              {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Vol: {new Intl.NumberFormat().format(stock.volume)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                No market data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Module access section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Module Activity</CardTitle>
            <CardDescription>Your recent usage across Neufin platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-purple-100 p-2 rounded-md mr-3">
                  <Brain className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="font-medium">Sentiment Analysis</div>
                  <p className="text-sm text-muted-foreground">Analyzed market sentiment for tech sector</p>
                  <div className="text-xs text-muted-foreground mt-1">4 hours ago</div>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="bg-amber-100 p-2 rounded-md mr-3">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="font-medium">Investment Recommendation</div>
                  <p className="text-sm text-muted-foreground">Generated 5 new stock recommendations</p>
                  <div className="text-xs text-muted-foreground mt-1">Yesterday</div>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="bg-green-100 p-2 rounded-md mr-3">
                  <PieChart className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="font-medium">Bias Analysis</div>
                  <p className="text-sm text-muted-foreground">Completed quarterly cognitive bias assessment</p>
                  <div className="text-xs text-muted-foreground mt-1">3 days ago</div>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Module Access</CardTitle>
            <CardDescription>Jump directly to specific Neufin modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button className="flex items-center justify-center h-auto py-6 gap-3" variant="outline">
                <Brain className="h-6 w-6 text-purple-500" />
                <div className="text-left">
                  <div className="font-medium">Sentient</div>
                  <div className="text-xs text-muted-foreground">Market sentiment analysis</div>
                </div>
              </Button>
              
              <Button className="flex items-center justify-center h-auto py-6 gap-3" variant="outline">
                <BarChart2 className="h-6 w-6 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Nemo</div>
                  <div className="text-xs text-muted-foreground">Stock intelligence suite</div>
                </div>
              </Button>
              
              <Button className="flex items-center justify-center h-auto py-6 gap-3" variant="outline">
                <Lightbulb className="h-6 w-6 text-amber-500" />
                <div className="text-left">
                  <div className="font-medium">O2</div>
                  <div className="text-xs text-muted-foreground">AI investment recommendations</div>
                </div>
              </Button>
              
              <Button className="flex items-center justify-center h-auto py-6 gap-3" variant="outline">
                <PieChart className="h-6 w-6 text-green-500" />
                <div className="text-left">
                  <div className="font-medium">BBA</div>
                  <div className="text-xs text-muted-foreground">Behavioral bias analyzer</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* AI Assistant */}
      <div className="fixed bottom-6 right-6">
        {!showAIAssistant ? (
          <Button 
            onClick={() => setShowAIAssistant(true)}
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        ) : (
          <Card className="w-80 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  Neufin Assistant
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAIAssistant(false)} className="h-8 w-8 p-0">
                  &times;
                </Button>
              </div>
              <CardDescription>Ask me anything about your finances</CardDescription>
            </CardHeader>
            <CardContent>
              {aiResponse && (
                <div className="bg-muted p-3 rounded-lg mb-3 text-sm">
                  {aiResponse}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="flex-1 border rounded-md px-3 py-2 text-sm"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIQuery()}
                />
                <Button 
                  onClick={handleAIQuery} 
                  disabled={isAiLoading}
                  size="sm"
                >
                  {isAiLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    "Ask"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;