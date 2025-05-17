import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import PlaidConnect from '@/components/plaid/PlaidLink';
import AccountsList from '@/components/plaid/AccountsList';
import HoldingsList from '@/components/plaid/HoldingsList';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function InvestmentAccounts() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // This will be used to refresh the accounts data
  const handleAccountConnected = () => {
    toast({
      title: 'Success!',
      description: 'Your investment account has been successfully connected.',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Login Required</h1>
          <p className="mb-6">Please sign in to access your investment accounts.</p>
          <Button asChild>
            <Link href="/api/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Investment Accounts | Neufin</title>
        <meta name="description" content="Securely connect and view your investment accounts and holdings with Neufin" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Investment Accounts</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <AccountsList />
            <div className="hidden lg:block">
              <PlaidConnect />
            </div>
          </div>
          
          <div>
            <HoldingsList />
          </div>
        </div>
        
        <div className="mt-8 lg:hidden">
          <PlaidConnect />
        </div>
      </div>
    </>
  );
}