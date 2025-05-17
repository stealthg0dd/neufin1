import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Search, TrendingUp, TrendingDown, BarChart3, Info, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Temporarily use mock data for development
import { stockData } from '../data/stockData';

const StockAnalysis = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [timeRange, setTimeRange] = useState('1M');
  const [activeTab, setActiveTab] = useState('overview');
  const [, setLocation] = useLocation();

  // When using real API:
  // const { data: stockInfo, isLoading, error, refetch } = useQuery({ 
  //   queryKey: ['/api/nemo/stocks', selectedStock], 
  //   enabled: !!selectedStock 
  // });
  
  // For now, use mock data
  const stockInfo = {
    stock: stockData.currentStocks.find(s => s.symbol === selectedStock) || stockData.currentStocks[0],
    prices: stockData.priceHistory[selectedStock as keyof typeof stockData.priceHistory] || [],
    indicators: stockData.indicators[selectedStock as keyof typeof stockData.indicators] || {},
    analysis: stockData.analysis[selectedStock as keyof typeof stockData.analysis] || {}
  };
  
  const isLoading = false;
  const error = null;
  const refetch = () => console.log('Refetching data...');

  // Handle search submissions
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In real app, would search API and show results
      setSelectedStock(searchQuery.toUpperCase());
      setSearchQuery('');
    }
  };

  // Format dollar amounts
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '-';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage changes with color indication
  const formatPercentChange = (value?: number) => {
    if (value === undefined) return '-';
    const isPositive = value >= 0;
    return (
      <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
        {isPositive ? '+' : ''}{value.toFixed(2)}%
        {isPositive ? <ArrowUpRight className="inline ml-1 h-4 w-4" /> : <ArrowDownRight className="inline ml-1 h-4 w-4" />}
      </span>
    );
  };
  
  // Format technical indicator values
  const formatIndicator = (value?: number | string) => {
    if (value === undefined || value === null) return '-';
    return typeof value === 'number' ? value.toFixed(2) : value;
  };
  
  // Determine outlook badge styling
  const getOutlookBadge = (outlook?: string) => {
    if (!outlook) return <Badge variant="outline">Unknown</Badge>;
    
    switch(outlook.toLowerCase()) {
      case 'bullish':
        return <Badge className="bg-green-500">Bullish</Badge>;
      case 'bearish':
        return <Badge className="bg-red-500">Bearish</Badge>;
      default:
        return <Badge className="bg-yellow-500">Neutral</Badge>;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load stock information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Neufin Nemo</h1>
        <p className="text-muted-foreground">
          AI-Powered Stock Intelligence Suite
        </p>
      </header>

      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search stock symbol (e.g., AAPL, MSFT)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="default">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {/* Stock Overview Card */}
      {isLoading ? (
        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-1/4 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">{stockInfo.stock.symbol}: {stockInfo.stock.name}</CardTitle>
              <CardDescription>
                Last updated: {new Date().toLocaleString()}
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-1">
                  {formatCurrency(stockInfo.stock.price)}
                </h3>
                <div className="flex items-center">
                  {formatPercentChange(stockInfo.stock.percentChange)}
                  <span className="text-sm text-muted-foreground ml-2">
                    {formatCurrency(stockInfo.stock.change)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">RSI (14)</p>
                  <p className={`text-lg font-medium ${
                    Number(stockInfo.indicators.rsi14) > 70 ? 'text-red-500' : 
                    Number(stockInfo.indicators.rsi14) < 30 ? 'text-green-500' : ''
                  }`}>
                    {formatIndicator(stockInfo.indicators.rsi14)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">MACD</p>
                  <p className={`text-lg font-medium ${
                    Number(stockInfo.indicators.macdHistogram) > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatIndicator(stockInfo.indicators.macdHistogram)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Short-Term</p>
                  <p className="text-lg font-medium">
                    {getOutlookBadge(stockInfo.analysis.shortTermOutlook)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Long-Term</p>
                  <p className="text-lg font-medium">
                    {getOutlookBadge(stockInfo.analysis.longTermOutlook)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Range Selection */}
      <div className="mb-4 flex space-x-2">
        {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range}
          </Button>
        ))}
      </div>

      {/* Tabs for different analysis views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          {isLoading ? (
            <Skeleton className="h-[400px] w-full mb-8" />
          ) : (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Price History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={stockInfo.prices}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="close" 
                        stroke="#0ea5e9" 
                        fillOpacity={1} 
                        fill="url(#colorPrice)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Volume Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Trading Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stockInfo.prices}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <XAxis dataKey="date" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Support & Resistance</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-muted-foreground mb-1">Resistance Levels</h4>
                      <div className="flex flex-wrap gap-2">
                        {stockInfo.analysis.resistanceLevels?.map((level: number, index: number) => (
                          <Badge key={index} variant="outline" className="text-red-500 border-red-500">
                            {formatCurrency(level)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-muted-foreground mb-1">Support Levels</h4>
                      <div className="flex flex-wrap gap-2">
                        {stockInfo.analysis.supportLevels?.map((level: number, index: number) => (
                          <Badge key={index} variant="outline" className="text-green-500 border-green-500">
                            {formatCurrency(level)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Key Events</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stockInfo.analysis.keyEvents?.length > 0 ? (
                      stockInfo.analysis.keyEvents.map((event: any, index: number) => (
                        <div key={index} className="flex items-start gap-2 pb-2 border-b last:border-0">
                          <div className={`p-1.5 rounded-full mt-0.5 ${
                            event.type.includes('breakout') && event.direction === 'upward' ? 'bg-green-100' :
                            event.type.includes('breakout') && event.direction === 'downward' ? 'bg-red-100' :
                            event.type.includes('golden') ? 'bg-yellow-100' :
                            event.type.includes('death') ? 'bg-gray-100' :
                            event.type.includes('overbought') ? 'bg-red-100' :
                            event.type.includes('oversold') ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <Info className={`h-4 w-4 ${
                              event.type.includes('breakout') && event.direction === 'upward' ? 'text-green-500' :
                              event.type.includes('breakout') && event.direction === 'downward' ? 'text-red-500' :
                              event.type.includes('golden') ? 'text-yellow-500' :
                              event.type.includes('death') ? 'text-gray-500' :
                              event.type.includes('overbought') ? 'text-red-500' :
                              event.type.includes('oversold') ? 'text-green-500' : 'text-blue-500'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">
                              {event.type.replace('_', ' ')}
                              {event.direction && ` (${event.direction})`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {event.description || ''} - {new Date(event.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No significant events detected recently.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Technical Indicators Tab */}
        <TabsContent value="technical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Moving Averages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stockInfo.prices}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="close" name="Price" stroke="#0ea5e9" dot={false} />
                      {stockInfo.indicators.ema20 && (
                        <Line type="monotone" name="EMA 20" stroke="#10b981" dot={false} strokeWidth={1.5}
                          data={Array(stockInfo.prices.length).fill({}).map((_, i) => ({
                            date: stockInfo.prices[i].date,
                            value: parseFloat(stockInfo.indicators.ema20?.toString() || '0')
                          }))} dataKey="value" />
                      )}
                      {stockInfo.indicators.ema50 && (
                        <Line type="monotone" name="EMA 50" stroke="#6366f1" dot={false} strokeWidth={1.5}
                          data={Array(stockInfo.prices.length).fill({}).map((_, i) => ({
                            date: stockInfo.prices[i].date,
                            value: parseFloat(stockInfo.indicators.ema50?.toString() || '0')
                          }))} dataKey="value" />
                      )}
                      {stockInfo.indicators.ema200 && (
                        <Line type="monotone" name="EMA 200" stroke="#f43f5e" dot={false} strokeWidth={1.5}
                          data={Array(stockInfo.prices.length).fill({}).map((_, i) => ({
                            date: stockInfo.prices[i].date,
                            value: parseFloat(stockInfo.indicators.ema200?.toString() || '0')
                          }))} dataKey="value" />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>RSI & MACD</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <h4 className="font-medium mb-2">RSI (14)</h4>
                    <div className="h-[100px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={stockInfo.prices.slice(-14)}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line type="monotone" name="RSI" stroke="#10b981" dot={false} strokeWidth={1.5}
                            data={Array(14).fill({}).map((_, i) => ({
                              date: stockInfo.prices.slice(-14)[i]?.date,
                              value: parseFloat(stockInfo.indicators.rsi14?.toString() || '50')
                            }))} dataKey="value" />
                          <Line type="monotone" name="Overbought" stroke="#f43f5e" dot={false} strokeDasharray="3 3"
                            data={Array(14).fill({}).map((_, i) => ({
                              date: stockInfo.prices.slice(-14)[i]?.date,
                              value: 70
                            }))} dataKey="value" />
                          <Line type="monotone" name="Oversold" stroke="#10b981" dot={false} strokeDasharray="3 3"
                            data={Array(14).fill({}).map((_, i) => ({
                              date: stockInfo.prices.slice(-14)[i]?.date,
                              value: 30
                            }))} dataKey="value" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">MACD</h4>
                    <div className="h-[100px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stockInfo.prices.slice(-14)}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar name="MACD Histogram" dataKey="value"
                            data={Array(14).fill({}).map((_, i) => ({
                              date: stockInfo.prices.slice(-14)[i]?.date,
                              value: parseFloat(stockInfo.indicators.macdHistogram?.toString() || '0')
                            }))}
                            fill={(entry) => entry.value >= 0 ? '#10b981' : '#f43f5e'} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Technical Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">RSI (14)</p>
                  <p className="text-lg font-medium">{formatIndicator(stockInfo.indicators.rsi14)}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">MACD</p>
                  <p className="text-lg font-medium">{formatIndicator(stockInfo.indicators.macd)}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">MACD Signal</p>
                  <p className="text-lg font-medium">{formatIndicator(stockInfo.indicators.macdSignal)}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">MACD Histogram</p>
                  <p className="text-lg font-medium">{formatIndicator(stockInfo.indicators.macdHistogram)}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">EMA (20)</p>
                  <p className="text-lg font-medium">{formatIndicator(stockInfo.indicators.ema20)}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">EMA (50)</p>
                  <p className="text-lg font-medium">{formatIndicator(stockInfo.indicators.ema50)}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">EMA (200)</p>
                  <p className="text-lg font-medium">{formatIndicator(stockInfo.indicators.ema200)}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Bollinger Middle</p>
                  <p className="text-lg font-medium">{formatIndicator(stockInfo.indicators.bollingerMiddle)}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Bollinger Upper</p>
                  <p className="text-lg font-medium">{formatIndicator(stockInfo.indicators.bollingerUpper)}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Bollinger Lower</p>
                  <p className="text-lg font-medium">{formatIndicator(stockInfo.indicators.bollingerLower)}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Momentum</p>
                  <p className="text-lg font-medium">{formatIndicator(stockInfo.indicators.momentum)}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground">Volatility</p>
                  <p className="text-lg font-medium">{formatIndicator(stockInfo.indicators.volatility)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>AI Analysis Summary</span>
                {stockInfo.analysis.shortTermOutlook && (
                  <Badge className={`ml-2 ${
                    stockInfo.analysis.shortTermOutlook === 'bullish' ? 'bg-green-500' :
                    stockInfo.analysis.shortTermOutlook === 'bearish' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}>
                    {stockInfo.analysis.shortTermOutlook.charAt(0).toUpperCase() + stockInfo.analysis.shortTermOutlook.slice(1)}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p className="mb-4">{stockInfo.analysis.aiSummary || 'No AI analysis available for this stock yet.'}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Short-Term Outlook (1-7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium">Assessment:</span>
                  {getOutlookBadge(stockInfo.analysis.shortTermOutlook)}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Key Supporting Indicators</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 border rounded-md">
                        <p className="text-xs text-muted-foreground">RSI (14)</p>
                        <p className="text-sm font-medium">{formatIndicator(stockInfo.indicators.rsi14)}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <p className="text-xs text-muted-foreground">MACD Histogram</p>
                        <p className="text-sm font-medium">{formatIndicator(stockInfo.indicators.macdHistogram)}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <p className="text-xs text-muted-foreground">EMA (20)</p>
                        <p className="text-sm font-medium">{formatIndicator(stockInfo.indicators.ema20)}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <p className="text-xs text-muted-foreground">Momentum</p>
                        <p className="text-sm font-medium">{formatIndicator(stockInfo.indicators.momentum)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Long-Term Outlook (30-90 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-medium">Assessment:</span>
                  {getOutlookBadge(stockInfo.analysis.longTermOutlook)}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-muted-foreground mb-1">Key Supporting Indicators</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 border rounded-md">
                        <p className="text-xs text-muted-foreground">EMA (50)</p>
                        <p className="text-sm font-medium">{formatIndicator(stockInfo.indicators.ema50)}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <p className="text-xs text-muted-foreground">EMA (200)</p>
                        <p className="text-sm font-medium">{formatIndicator(stockInfo.indicators.ema200)}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <p className="text-xs text-muted-foreground">Volatility</p>
                        <p className="text-sm font-medium">{formatIndicator(stockInfo.indicators.volatility)}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <p className="text-xs text-muted-foreground">Price vs SMA (200)</p>
                        <p className="text-sm font-medium">{formatIndicator(stockInfo.indicators.sma200)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Comparison Tab */}
        <TabsContent value="comparison">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Compare With Other Stocks</CardTitle>
              <CardDescription>
                Compare key metrics against other major stocks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(stockData.comparison.metrics.perChange).map(([key, value]) => ({
                      name: key,
                      value: value
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`${value.toFixed(2)}%`, 'Percent Change']} />
                    <Legend />
                    <Bar dataKey="value" name="Percent Change">
                      {Object.entries(stockData.comparison.metrics.perChange).map(([key, value], index) => (
                        <Cell key={`cell-${index}`} fill={value >= 0 ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Comparative Metrics</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Change %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">RSI</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">MACD</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Volatility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stockData.comparison.stocks.map(symbol => (
                        <tr key={symbol} className={symbol === selectedStock ? 'bg-blue-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{symbol}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatCurrency(stockData.comparison.metrics.price[symbol as keyof typeof stockData.comparison.metrics.price])}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={stockData.comparison.metrics.perChange[symbol as keyof typeof stockData.comparison.metrics.perChange] >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {stockData.comparison.metrics.perChange[symbol as keyof typeof stockData.comparison.metrics.perChange].toFixed(2)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {stockData.comparison.metrics.rsi[symbol as keyof typeof stockData.comparison.metrics.rsi].toFixed(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={stockData.comparison.metrics.macd[symbol as keyof typeof stockData.comparison.metrics.macd] >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {stockData.comparison.metrics.macd[symbol as keyof typeof stockData.comparison.metrics.macd].toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(stockData.comparison.metrics.volatility[symbol as keyof typeof stockData.comparison.metrics.volatility] * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Market Anomalies</CardTitle>
              <CardDescription>
                Stocks showing unusual technical behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stockData.anomalies.map((anomaly, index) => (
                  <Card key={index} className="border-2 border-amber-400">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{anomaly.symbol}: {anomaly.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">RSI (14)</p>
                          <p className={`text-sm font-medium ${Number(anomaly.indicators.rsi14) > 70 ? 'text-red-500' : Number(anomaly.indicators.rsi14) < 30 ? 'text-green-500' : ''}`}>
                            {anomaly.indicators.rsi14.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">MACD Hist</p>
                          <p className={`text-sm font-medium ${Number(anomaly.indicators.macdHistogram) > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {anomaly.indicators.macdHistogram.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Volatility</p>
                          <p className="text-sm font-medium">
                            {(Number(anomaly.indicators.volatility) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Anomaly Score</p>
                          <p className="text-sm font-medium font-bold text-amber-500">
                            {anomaly.anomalyScore}/10
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setSelectedStock(anomaly.symbol)}
                      >
                        Analyze
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockAnalysis;