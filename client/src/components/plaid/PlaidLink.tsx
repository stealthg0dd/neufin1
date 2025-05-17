import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Define types for Plaid callback functions
interface PlaidLinkOnSuccess {
  (publicToken: string, metadata: any): void;
}

interface PlaidLinkOnExit {
  (error: any, metadata?: any): void;
}

interface PlaidLinkOptions {
  token: string;
  onSuccess: PlaidLinkOnSuccess;
  onExit?: PlaidLinkOnExit;
}

interface PlaidLinkProps {
  onSuccess?: () => void;
}

// Import Plaid Link dynamically to avoid SSR issues
const usePlaidLink = () => {
  const [PlaidLink, setPlaidLink] = useState<any>(null);

  useEffect(() => {
    import('react-plaid-link')
      .then((module) => {
        setPlaidLink(module.usePlaidLink);
      })
      .catch((error) => {
        console.error('Error loading Plaid Link:', error);
      });
  }, []);

  return PlaidLink;
};

export const PlaidLinkButton: React.FC<PlaidLinkProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const usePlaidLinkHook = usePlaidLink();

  // Fetch link token from our backend
  const { data: linkTokenData, isLoading: isLoadingToken, error: tokenError } = useQuery({
    queryKey: ['/api/plaid/link-token'],
    enabled: !!isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Exchange public token mutation
  const { mutate: exchangeToken, isPending: isExchanging } = useMutation({
    mutationFn: async (publicToken: { publicToken: string, metadata: any }) => {
      return apiRequest('/api/plaid/exchange-public-token', 'POST', {
        publicToken: publicToken.publicToken,
        institutionId: publicToken.metadata.institution.institution_id,
        institutionName: publicToken.metadata.institution.name,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Account Connected',
        description: 'Your investment account has been successfully linked.',
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/plaid/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/plaid/holdings'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Connection Error',
        description: error.message || 'Failed to link your account. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onPlaidSuccess = useCallback<PlaidLinkOnSuccess>(
    (publicToken: string, metadata: any) => {
      exchangeToken({ publicToken, metadata });
    },
    [exchangeToken]
  );

  const onPlaidExit = useCallback<PlaidLinkOnExit>(
    (error: any) => {
      if (error) {
        toast({
          title: 'Connection Cancelled',
          description: error.display_message || error.error_message || 'Account linking was cancelled.',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  // Configure Plaid Link
  const plaidConfig: PlaidLinkOptions = {
    token: linkTokenData?.link_token,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  };

  const { open, ready } = usePlaidLinkHook?.(plaidConfig) || { open: undefined, ready: false };

  // Handle errors
  useEffect(() => {
    if (tokenError) {
      toast({
        title: 'Service Error',
        description: 'Unable to connect to investment service. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [tokenError, toast]);

  const handleClick = useCallback(() => {
    if (ready && open) {
      open();
    } else if (!linkTokenData) {
      toast({
        title: 'Connection Error',
        description: 'Unable to initialize account connection. Please try again.',
        variant: 'destructive',
      });
    }
  }, [ready, open, linkTokenData, toast]);

  return (
    <Button 
      onClick={handleClick} 
      disabled={!ready || isLoadingToken || isExchanging || !linkTokenData}
      className="w-full"
    >
      {isLoadingToken || isExchanging ? 'Connecting...' : 'Link Investment Account'}
    </Button>
  );
};

const PlaidConnect: React.FC = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connect Investment Accounts</CardTitle>
        <CardDescription>
          Securely link your investment accounts to get personalized insights and analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PlaidLinkButton />
      </CardContent>
    </Card>
  );
};

export default PlaidConnect;