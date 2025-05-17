import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowRight, 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw 
} from 'lucide-react';
import { 
  useMarketOverview, 
  useRealTimeQuote, 
  refreshSymbolData,
  type RealTimeQuote
} from '@/hooks/useMarketData';
import { useToast } from '@/hooks/use-toast';

/**
 * Displays the change value with appropriate styling based on whether it's positive or negative
 */
const PriceChange: React.FC<{ change: number; asPercent?: boolean }> = ({ change, asPercent = false }) => {
  const formattedChange = asPercent 
    ? `${change >= 0 ? '+' : ''}${(change * 100).toFixed(2)}%`
    : `${change >= 0 ? '+' : ''}${change.toFixed(2)}`;
    
  return (
    <span className={`font-semibold ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
      {change > 0 ? (
        <ArrowUpRight className="inline h-3 w-3 mr-1" />
      ) : change < 0 ? (
        <ArrowDownRight className="inline h-3 w-3 mr-1" />
      ) : (
        <ArrowRight className="inline h-3 w-3 mr-1" />
      )}
      {formattedChange}
    </span>
  );
};

/**
 * A single stock quote item for display in lists
 */
const QuoteItem: React.FC<{ quote: RealTimeQuote }> = ({ quote }) => {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <div className="font-medium">{quote.symbol}</div>
        <div className="text-sm text-gray-500">${quote.price.toFixed(2)}</div>
      </div>
      <PriceChange change={quote.change} asPercent={true} />
    </div>
  );
};

/**
 * A more detailed quote card for a single stock
 */
export const QuoteCard: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { data: quote, isLoading, refetch } = useRealTimeQuote(symbol);
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSymbolData(symbol);
      await refetch();
      toast({
        title: "Data refreshed",
        description: `Latest market data for ${symbol} has been fetched.`,
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh market data, please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{symbol}</CardTitle>
            <CardDescription>Real-time market data</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading || !quote ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-bold">${quote.price.toFixed(2)}</div>
              <div className="flex items-center mt-1">
                <PriceChange change={quote.change} />
                <span className="text-gray-500 mx-1">|</span>
                <PriceChange change={quote.changePercent} asPercent={true} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-gray-500">Open</div>
                <div>${quote.open.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">Prev Close</div>
                <div>${quote.previousClose.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">High</div>
                <div>${quote.high.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">Low</div>
                <div>${quote.low.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Volume: {quote.volume.toLocaleString()}
              <span className="mx-1">•</span>
              {new Date(quote.timestamp || '').toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Main market data widget showing overview of market conditions
 */
const MarketDataWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data: marketOverview, isLoading, refetch } = useMarketOverview();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Market data refreshed",
        description: "Latest market data has been fetched.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh market data, please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-blue-600" /> 
              Market Overview
            </CardTitle>
            <CardDescription>Real-time financial market data</CardDescription>
          </div>
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="indices">
          <div className="px-6 border-b">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="indices">Indices</TabsTrigger>
              <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
              <TabsTrigger value="losers">Top Losers</TabsTrigger>
              <TabsTrigger value="active">Most Active</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6">
            {isLoading || !marketOverview ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="indices" className="m-0">
                  {marketOverview.marketIndices.map((quote) => (
                    <QuoteItem key={quote.symbol} quote={quote} />
                  ))}
                  
                  {marketOverview.marketIndices.length === 0 && (
                    <div className="text-center py-3 text-sm text-gray-500">
                      No market indices data available
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="gainers" className="m-0">
                  {marketOverview.topGainers.map((quote) => (
                    <QuoteItem key={quote.symbol} quote={quote} />
                  ))}
                  
                  {marketOverview.topGainers.length === 0 && (
                    <div className="text-center py-3 text-sm text-gray-500">
                      No top gainers data available
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="losers" className="m-0">
                  {marketOverview.topLosers.map((quote) => (
                    <QuoteItem key={quote.symbol} quote={quote} />
                  ))}
                  
                  {marketOverview.topLosers.length === 0 && (
                    <div className="text-center py-3 text-sm text-gray-500">
                      No top losers data available
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="active" className="m-0">
                  {marketOverview.mostActive.map((quote) => (
                    <QuoteItem key={quote.symbol} quote={quote} />
                  ))}
                  
                  {marketOverview.mostActive.length === 0 && (
                    <div className="text-center py-3 text-sm text-gray-500">
                      No most active stocks data available
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-4 pb-4 text-xs text-gray-500">
        <div className="flex justify-between w-full">
          <div>
            Data delayed by 15 minutes unless indicated
          </div>
          <div>
            {!isLoading && marketOverview && (
              <>Last updated: {new Date(marketOverview.lastUpdated).toLocaleTimeString()}</>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MarketDataWidget;