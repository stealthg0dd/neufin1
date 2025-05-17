import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Loader2, TrendingUp, TrendingDown, MinusCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for development
import { sentimentData } from '@/data/mockData';

// Colors for sentiment visualization
const COLORS = {
  positive: '#10b981', // green
  neutral: '#f59e0b',  // amber
  negative: '#ef4444', // red
  background: '#f8fafc', // light slate
  text: '#334155',     // slate
  grid: '#e2e8f0',     // slate
};

const SentimentDashboard = () => {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | 'ALL'>('1W');
  const [activeSymbol, setActiveSymbol] = useState('SPY');
  
  // Fetch sentiment overview data
  const { data: overviewData, isLoading: isLoadingOverview } = useQuery({
    queryKey: ['/api/sentient/overview', timeRange],
    // Will use the app's preconfigured fetcher
  });
  
  // Fetch data for the selected symbol
  const { data: symbolData, isLoading: isLoadingSymbol } = useQuery({
    queryKey: ['/api/sentient/symbol', activeSymbol, timeRange],
    // Will use the app's preconfigured fetcher
  });
  
  // For development, use mock data until API is connected
  const overview = overviewData || sentimentData.overview;
  const symbol = symbolData || sentimentData.symbols[activeSymbol] || sentimentData.symbols.SPY;
  const isLoading = isLoadingOverview || isLoadingSymbol;
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'positive': return COLORS.positive;
      case 'negative': return COLORS.negative;
      default: return COLORS.neutral;
    }
  };
  
  // Get trend icon
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'upward': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'downward': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <MinusCircle className="h-5 w-5 text-amber-500" />;
    }
  };
  
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Market Sentiment Analysis</h2>
        <Tabs defaultValue={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList>
            <TabsTrigger value="1D">1D</TabsTrigger>
            <TabsTrigger value="1W">1W</TabsTrigger>
            <TabsTrigger value="1M">1M</TabsTrigger>
            <TabsTrigger value="ALL">ALL</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading sentiment data...</span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Overall Market Sentiment Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Overall Market</CardTitle>
              <CardDescription>Aggregated sentiment across all symbols</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold">{overview.overall.score}</div>
                  <Badge 
                    className={cn(
                      "mt-1",
                      overview.overall.status === 'positive' ? "bg-green-100 text-green-800" :
                      overview.overall.status === 'negative' ? "bg-red-100 text-red-800" :
                      "bg-amber-100 text-amber-800"
                    )}
                  >
                    {overview.overall.status.toUpperCase()}
                  </Badge>
                </div>
                <div 
                  className="h-24 w-24 rounded-full flex items-center justify-center"
                  style={{ 
                    background: `conic-gradient(${getStatusColor(overview.overall.status)} ${overview.overall.score}%, ${COLORS.background} 0)` 
                  }}
                >
                  <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-xl font-semibold">
                    {overview.overall.score}%
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex items-center text-sm text-muted-foreground">
                {overview.overall.change > 0 ? (
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                ) : overview.overall.change < 0 ? (
                  <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                ) : (
                  <MinusCircle className="mr-1 h-4 w-4 text-amber-500" />
                )}
                <span>
                  {Math.abs(overview.overall.change).toFixed(1)}% 
                  {overview.overall.change > 0 ? ' increase' : overview.overall.change < 0 ? ' decrease' : ' no change'} 
                  in the last {timeRange}
                </span>
              </div>
            </CardFooter>
          </Card>
          
          {/* Sector Breakdown Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sector Breakdown</CardTitle>
              <CardDescription>Sentiment across industry sectors</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Object.entries(overview.sectors).map(([name, data]: [string, any]) => ({
                  name,
                  score: data.score,
                  status: data.status
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar 
                    dataKey="score" 
                    name="Sentiment Score" 
                    fill={COLORS.neutral}
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  >
                    {Object.entries(overview.sectors).map(([name, data]: [string, any], index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(data.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Symbol Trend Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Symbol Focus</CardTitle>
              <CardDescription>
                <select 
                  value={activeSymbol}
                  onChange={(e) => setActiveSymbol(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option value="SPY">S&P 500 (SPY)</option>
                  <option value="QQQ">Nasdaq (QQQ)</option>
                  <option value="AAPL">Apple (AAPL)</option>
                  <option value="MSFT">Microsoft (MSFT)</option>
                  <option value="GOOGL">Alphabet (GOOGL)</option>
                  <option value="AMZN">Amazon (AMZN)</option>
                </select>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div>
                  <div className="text-3xl font-bold">{symbol.data[0]?.sentimentScore || 50}</div>
                  <div className="flex items-center mt-1">
                    {getTrendIcon(symbol.trend.direction)}
                    <span className="text-sm ml-1 capitalize">{symbol.trend.direction} trend</span>
                  </div>
                </div>
                <Badge 
                  className={cn(
                    "ml-auto",
                    symbol.trend.magnitude === 'high' ? "bg-purple-100 text-purple-800" :
                    symbol.trend.magnitude === 'medium' ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  )}
                >
                  {symbol.trend.magnitude.toUpperCase()} VOLATILITY
                </Badge>
              </div>
              
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={symbol.data.slice(0, 10).reverse()}>
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sentimentScore"
                    name="Sentiment"
                    stroke={getStatusColor(symbol.data[0]?.status || 'neutral')}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="text-sm text-muted-foreground flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Based on {symbol.data.length} data points from financial news and social media
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Historical Trend Analysis */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Historical Sentiment Trends</CardTitle>
          <CardDescription>
            Tracking market sentiment across time to identify patterns and shifts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="linechart">
            <TabsList className="mb-4">
              <TabsTrigger value="linechart">Line Chart</TabsTrigger>
              <TabsTrigger value="barchart">Bar Chart</TabsTrigger>
            </TabsList>
            
            <TabsContent value="linechart">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sentimentData.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="overall" name="Overall Market" stroke="#0ea5e9" strokeWidth={2} />
                  <Line type="monotone" dataKey="tech" name="Technology" stroke="#8b5cf6" />
                  <Line type="monotone" dataKey="finance" name="Finance" stroke="#f59e0b" />
                  <Line type="monotone" dataKey="healthcare" name="Healthcare" stroke="#10b981" />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="barchart">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sentimentData.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="overall" name="Overall Market" fill="#0ea5e9" />
                  <Bar dataKey="tech" name="Technology" fill="#8b5cf6" />
                  <Bar dataKey="finance" name="Finance" fill="#f59e0b" />
                  <Bar dataKey="healthcare" name="Healthcare" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentDashboard;