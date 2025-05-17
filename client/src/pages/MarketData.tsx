import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Card, 
  CardContent,
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Search, BarChart3, TrendingUp } from 'lucide-react';
import MarketDataWidget, { QuoteCard } from '@/components/market-data/MarketDataWidget';

export default function MarketData() {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [trackedSymbols, setTrackedSymbols] = useState<string[]>(['AAPL', 'MSFT', 'GOOGL']);
  const { toast } = useToast();

  const handleAddSymbol = () => {
    const symbol = searchSymbol.trim().toUpperCase();
    
    if (!symbol) {
      toast({
        title: "Symbol required",
        description: "Please enter a stock symbol to track.",
        variant: "destructive",
      });
      return;
    }
    
    if (trackedSymbols.includes(symbol)) {
      toast({
        title: "Already tracking",
        description: `The symbol ${symbol} is already in your watchlist.`,
        variant: "destructive",
      });
      return;
    }
    
    setTrackedSymbols([...trackedSymbols, symbol]);
    setSearchSymbol('');
    
    toast({
      title: "Symbol added",
      description: `${symbol} has been added to your watchlist.`,
    });
  };

  return (
    <>
      <Helmet>
        <title>Market Data | Neufin Financial Intelligence</title>
        <meta 
          name="description" 
          content="Access real-time financial market data, including stock quotes, market indices, and sector performance through Neufin's comprehensive market data dashboard." 
        />
      </Helmet>

      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <BarChart3 className="mr-2 h-8 w-8 text-blue-600" />
            Market Data
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Track real-time financial market data, powered by Alpha Vantage API. Monitor market indices, 
            top performing stocks, and add custom symbols to your watchlist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MarketDataWidget className="mb-6" />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Your Watchlist
                </CardTitle>
                <CardDescription>
                  Track specific symbols you're interested in
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex mb-4">
                  <Input 
                    placeholder="Enter symbol (e.g., AAPL)" 
                    value={searchSymbol}
                    onChange={(e) => setSearchSymbol(e.target.value)}
                    className="mr-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSymbol();
                      }
                    }}
                  />
                  <Button onClick={handleAddSymbol}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trackedSymbols.map((symbol) => (
                    <QuoteCard key={symbol} symbol={symbol} />
                  ))}
                  
                  {trackedSymbols.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Search className="mx-auto h-12 w-12 mb-3 text-gray-400" />
                      <p>No symbols in your watchlist</p>
                      <p className="text-sm">Add symbols above to start tracking</p>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="text-xs text-gray-500 border-t pt-4">
                Data provided by Alpha Vantage. Market data may be delayed.
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Market Insights</CardTitle>
                <CardDescription>
                  AI-powered market analysis
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="sentiment">
                  <TabsList className="w-full">
                    <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="news">News</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="sentiment" className="pt-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="font-medium mb-1">Overall Market Sentiment</div>
                        <div className="text-2xl font-bold text-blue-700">Moderately Bullish</div>
                        <div className="text-sm text-blue-600 mt-1">
                          Sentiment increased 2.3% from yesterday
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium mb-2">Sector Sentiment</div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Technology</span>
                            <span className="font-medium text-green-600">Bullish</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Finance</span>
                            <span className="font-medium text-amber-600">Neutral</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Healthcare</span>
                            <span className="font-medium text-green-600">Bullish</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Energy</span>
                            <span className="font-medium text-red-600">Bearish</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="trends" className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <div className="font-medium mb-2">Emerging Trends</div>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Increasing interest in AI stocks</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Rotation from growth to value</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span>Rising treasury yields impacting tech</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <div className="font-medium mb-2">Market Movers Analysis</div>
                        <p className="text-sm text-gray-600">
                          Recent market moves have been driven by better-than-expected 
                          earnings reports and reduced inflation concerns, leading to 
                          broad-based gains across most sectors.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="news" className="pt-4">
                    <div className="space-y-4">
                      <div className="border-b pb-3">
                        <div className="font-medium">Fed signals potential rate cut</div>
                        <div className="text-sm text-gray-600">
                          Federal Reserve minutes suggest possibility of rate cuts later this year
                        </div>
                        <div className="text-xs text-gray-400 mt-1">2 hours ago</div>
                      </div>
                      
                      <div className="border-b pb-3">
                        <div className="font-medium">Tech earnings beat expectations</div>
                        <div className="text-sm text-gray-600">
                          Major tech companies reported stronger than expected Q1 results
                        </div>
                        <div className="text-xs text-gray-400 mt-1">4 hours ago</div>
                      </div>
                      
                      <div>
                        <div className="font-medium">Retail sales increase</div>
                        <div className="text-sm text-gray-600">
                          Consumer spending shows resilience despite inflation concerns
                        </div>
                        <div className="text-xs text-gray-400 mt-1">6 hours ago</div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="text-xs text-gray-500 border-t">
                Insights generated by Neufin AI based on market data and trends
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}