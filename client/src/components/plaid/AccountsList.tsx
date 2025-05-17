import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Separator } from "@/components/ui/separator";
import { Trash2 } from 'lucide-react';
import { PlaidLinkButton } from './PlaidLink';
import { apiRequest } from '@/lib/queryClient';

interface Account {
  id: number;
  name: string;
  mask: string | null;
  type: string;
  subtype: string | null;
  institution: string;
}

export const AccountsList: React.FC = () => {
  const { toast } = useToast();
  
  // Fetch accounts from API
  const { 
    data: accounts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/plaid/accounts'],
    staleTime: 1000 * 60, // 1 minute
  });

  // Handle delete account
  const handleDelete = async (itemId: number) => {
    if (!confirm('Are you sure you want to disconnect this account?')) {
      return;
    }
    
    try {
      await apiRequest(`/api/plaid/items/${itemId}`, 'DELETE');
      
      toast({
        title: 'Account Disconnected',
        description: 'Your investment account has been successfully disconnected.',
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disconnect account.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Investment Accounts</CardTitle>
          <CardDescription>Connected investment accounts</CardDescription>
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
          <CardTitle>Your Investment Accounts</CardTitle>
          <CardDescription>Connected investment accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-50 text-red-500 rounded-md">
            Error loading your accounts. Please try again later.
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => refetch()} variant="outline">Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Investment Accounts</CardTitle>
        <CardDescription>Connected investment accounts</CardDescription>
      </CardHeader>
      <CardContent>
        {accounts && accounts.length > 0 ? (
          <div className="space-y-4">
            {accounts.map((account: Account) => (
              <div key={account.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{account.name}</h3>
                    <p className="text-sm text-gray-500">
                      {account.institution} {account.mask ? `••••${account.mask}` : ''}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {account.type} {account.subtype ? `• ${account.subtype}` : ''}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(account.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-4">No investment accounts connected.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <PlaidLinkButton onSuccess={() => refetch()} />
      </CardFooter>
    </Card>
  );
};

export default AccountsList;