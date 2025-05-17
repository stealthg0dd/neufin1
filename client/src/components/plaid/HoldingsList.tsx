import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from '@/lib/utils';

interface Holding {
  securityId: string;
  accountId: number;
  symbol: string;
  name: string;
  quantity: number;
  costBasis: number | null;
  currentPrice: number | null;
  currentValue: number | null;
  isoCurrencyCode: string;
}

export const HoldingsList: React.FC = () => {
  const { toast } = useToast();
  
  // Fetch holdings from API
  const { 
    data: holdings,
    isLoading,
    error,
    refetch
  } = useQuery<Holding[]>({
    queryKey: ['/api/plaid/holdings'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Holdings</CardTitle>
          <CardDescription>Your current investment positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Investment Holdings</CardTitle>
          <CardDescription>Your current investment positions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-500 rounded-md">
            Error loading your holdings. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group holdings by symbol
  const holdingsBySymbol: Record<string, Holding[]> = {};
  
  if (holdings && holdings.length > 0) {
    holdings.forEach((holding) => {
      const symbol = holding.symbol || 'Unknown';
      if (!holdingsBySymbol[symbol]) {
        holdingsBySymbol[symbol] = [];
      }
      holdingsBySymbol[symbol].push(holding);
    });
  }

  // Calculate total position for each symbol
  const aggregatedHoldings = Object.entries(holdingsBySymbol).map(([symbol, holdings]) => {
    const totalQuantity = holdings.reduce((sum, h) => sum + h.quantity, 0);
    const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
    const name = holdings[0].name || 'Unknown Security';
    
    return {
      symbol,
      name,
      totalQuantity,
      totalValue,
      averagePrice: totalValue / totalQuantity,
      currency: holdings[0].isoCurrencyCode || 'USD',
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Holdings</CardTitle>
        <CardDescription>Your current investment positions</CardDescription>
      </CardHeader>
      <CardContent>
        {aggregatedHoldings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aggregatedHoldings.map((holding) => (
                <TableRow key={holding.symbol}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{holding.symbol}</Badge>
                  </TableCell>
                  <TableCell>{holding.name}</TableCell>
                  <TableCell className="text-right">{holding.totalQuantity.toFixed(4)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(holding.averagePrice, holding.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(holding.totalValue, holding.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">No investment holdings found. Connect an investment account to view your holdings.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HoldingsList;