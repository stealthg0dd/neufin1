/**
 * Plaid API Client for investment account integration
 */
import { Configuration, PlaidApi, PlaidEnvironments, InvestmentsHoldingsGetRequest, Products, InvestmentsTransactionsGetRequest, CountryCode, ItemPublicTokenExchangeRequest, LinkTokenCreateRequest } from 'plaid';
import { db } from '../../db';
import { storage } from '../../storage';
import { InsertPlaidItem, InsertPlaidAccount, InsertPlaidHolding, InsertPlaidInvestmentTransaction } from '@shared/schema';

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox, // Use production for live data
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

/**
 * Create a Plaid link token to initialize the Plaid Link flow
 */
export async function createLinkToken(userId: string): Promise<string> {
  console.log('Creating link token for user:', userId);
  
  const request: LinkTokenCreateRequest = {
    user: { client_user_id: userId },
    client_name: 'Neufin',
    products: ['investments'],
    country_codes: [CountryCode.Us],
    language: 'en',
  };

  try {
    const response = await plaidClient.linkTokenCreate(request);
    return response.data.link_token;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw new Error(`Failed to create link token: ${error.message}`);
  }
}

/**
 * Exchange a public token for an access token
 */
export async function exchangePublicToken(
  userId: string, 
  publicToken: string, 
  institutionId: string,
  institutionName: string
): Promise<string> {
  console.log('Exchanging public token for access token');
  
  try {
    const exchangeRequest: ItemPublicTokenExchangeRequest = {
      public_token: publicToken,
    };

    const exchangeResponse = await plaidClient.itemPublicTokenExchange(exchangeRequest);
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Store the item in the database
    const plaidItem: InsertPlaidItem = {
      userId,
      itemId,
      accessToken,
      institutionId,
      institutionName,
      status: 'active',
    };

    await storage.createPlaidItem(plaidItem);

    // Fetch and store investment accounts
    await fetchAndStoreInvestmentAccounts(userId, accessToken, itemId);

    return accessToken;
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw new Error(`Failed to exchange public token: ${error.message}`);
  }
}

/**
 * Fetch investment holdings for a user
 */
export async function fetchInvestmentHoldings(userId: string, accessToken?: string): Promise<any> {
  console.log('Fetching investment holdings for user:', userId);
  
  try {
    // If accessToken is not provided, get all tokens for the user
    const tokens = accessToken 
      ? [accessToken]
      : await storage.getPlaidAccessTokensByUserId(userId);
    
    if (!tokens || tokens.length === 0) {
      throw new Error('No access tokens found for user');
    }

    const allHoldings = [];
    
    for (const token of tokens) {
      const request: InvestmentsHoldingsGetRequest = {
        access_token: token,
      };

      const response = await plaidClient.investmentsHoldingsGet(request);
      
      // Format the response data
      const holdings = response.data.holdings.map(holding => ({
        securityId: holding.security_id,
        accountId: holding.account_id,
        quantity: holding.quantity,
        costBasis: holding.cost_basis || null,
        value: holding.institution_value || holding.institution_price * holding.quantity,
        name: response.data.securities.find(s => s.security_id === holding.security_id)?.name || '',
        symbol: response.data.securities.find(s => s.security_id === holding.security_id)?.ticker_symbol || '',
        price: holding.institution_price,
        isoCurrencyCode: holding.iso_currency_code || 'USD',
      }));

      allHoldings.push(...holdings);
      
      // Store the updated holdings in the database
      await storeHoldings(holdings, token);
    }

    return allHoldings;
  } catch (error) {
    console.error('Error fetching investment holdings:', error);
    throw new Error(`Failed to fetch investment holdings: ${error.message}`);
  }
}

/**
 * Fetch investment transactions for a user
 */
export async function fetchInvestmentTransactions(
  userId: string, 
  startDate: Date, 
  endDate: Date, 
  accessToken?: string
): Promise<any> {
  console.log('Fetching investment transactions for user:', userId);
  
  try {
    // If accessToken is not provided, get all tokens for the user
    const tokens = accessToken 
      ? [accessToken]
      : await storage.getPlaidAccessTokensByUserId(userId);
    
    if (!tokens || tokens.length === 0) {
      throw new Error('No access tokens found for user');
    }

    const allTransactions = [];
    
    for (const token of tokens) {
      const request: InvestmentsTransactionsGetRequest = {
        access_token: token,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      };

      const response = await plaidClient.investmentsTransactionsGet(request);
      
      // Format the response data
      const transactions = response.data.investment_transactions.map(transaction => ({
        accountId: transaction.account_id,
        transactionId: transaction.investment_transaction_id,
        securityId: transaction.security_id || null,
        name: response.data.securities.find(s => s.security_id === transaction.security_id)?.name || '',
        symbol: response.data.securities.find(s => s.security_id === transaction.security_id)?.ticker_symbol || '',
        type: transaction.type,
        amount: transaction.amount,
        date: new Date(transaction.date),
        price: transaction.price,
        quantity: transaction.quantity,
        fees: transaction.fees || 0,
      }));

      allTransactions.push(...transactions);
      
      // Store the transactions in the database
      await storeTransactions(transactions, token);
    }

    return allTransactions;
  } catch (error) {
    console.error('Error fetching investment transactions:', error);
    throw new Error(`Failed to fetch investment transactions: ${error.message}`);
  }
}

/**
 * Helper function to fetch and store investment accounts
 */
async function fetchAndStoreInvestmentAccounts(userId: string, accessToken: string, itemId: string): Promise<void> {
  try {
    // Fetch the item to get the corresponding database ID
    const item = await storage.getPlaidItemByItemId(itemId);
    
    if (!item) {
      throw new Error('Plaid item not found');
    }
    
    // Get accounts from Plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    
    // Store investment accounts
    const investmentAccounts = accountsResponse.data.accounts.filter(
      account => account.type === 'investment'
    );
    
    for (const account of investmentAccounts) {
      const plaidAccount: InsertPlaidAccount = {
        plaidItemId: item.id,
        accountId: account.account_id,
        name: account.name,
        mask: account.mask || null,
        officialName: account.official_name || null,
        type: account.type,
        subtype: account.subtype || null,
      };
      
      await storage.createPlaidAccount(plaidAccount);
    }
    
    // Fetch and store initial holdings and transactions
    await fetchInvestmentHoldings(userId, accessToken);
    
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    await fetchInvestmentTransactions(userId, oneYearAgo, today, accessToken);
  } catch (error) {
    console.error('Error fetching and storing investment accounts:', error);
    throw new Error(`Failed to store investment accounts: ${error.message}`);
  }
}

/**
 * Helper function to store holdings in the database
 */
async function storeHoldings(holdings: any[], accessToken: string): Promise<void> {
  try {
    // Get the item by access token
    const item = await storage.getPlaidItemByAccessToken(accessToken);
    
    if (!item) {
      throw new Error('Plaid item not found for access token');
    }
    
    // Get all accounts for this item
    const accounts = await storage.getPlaidAccountsByItemId(item.id);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found for Plaid item');
    }
    
    // Create a map of Plaid account IDs to our database account IDs
    const accountMap = new Map(
      accounts.map(account => [account.accountId, account.id])
    );
    
    // Store each holding
    for (const holding of holdings) {
      const dbAccountId = accountMap.get(holding.accountId);
      
      if (!dbAccountId) {
        console.warn(`Account ID ${holding.accountId} not found in database, skipping holding`);
        continue;
      }
      
      const plaidHolding: InsertPlaidHolding = {
        accountId: dbAccountId,
        securityId: holding.securityId,
        symbol: holding.symbol || null,
        name: holding.name || null,
        quantity: holding.quantity,
        costBasis: holding.costBasis || null,
        currentPrice: holding.price || null,
        currentValue: holding.value || null,
        isoCurrencyCode: holding.isoCurrencyCode || null,
      };
      
      await storage.createOrUpdatePlaidHolding(plaidHolding);
    }
  } catch (error) {
    console.error('Error storing holdings:', error);
    throw new Error(`Failed to store holdings: ${error.message}`);
  }
}

/**
 * Helper function to store transactions in the database
 */
async function storeTransactions(transactions: any[], accessToken: string): Promise<void> {
  try {
    // Get the item by access token
    const item = await storage.getPlaidItemByAccessToken(accessToken);
    
    if (!item) {
      throw new Error('Plaid item not found for access token');
    }
    
    // Get all accounts for this item
    const accounts = await storage.getPlaidAccountsByItemId(item.id);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found for Plaid item');
    }
    
    // Create a map of Plaid account IDs to our database account IDs
    const accountMap = new Map(
      accounts.map(account => [account.accountId, account.id])
    );
    
    // Store each transaction
    for (const transaction of transactions) {
      const dbAccountId = accountMap.get(transaction.accountId);
      
      if (!dbAccountId) {
        console.warn(`Account ID ${transaction.accountId} not found in database, skipping transaction`);
        continue;
      }
      
      // Check if transaction already exists
      const existingTransaction = await storage.getPlaidInvestmentTransactionByPlaidId(transaction.transactionId);
      
      if (existingTransaction) {
        // Skip if transaction already exists
        continue;
      }
      
      const plaidTransaction: InsertPlaidInvestmentTransaction = {
        accountId: dbAccountId,
        plaidTransactionId: transaction.transactionId,
        securityId: transaction.securityId || null,
        symbol: transaction.symbol || null,
        name: transaction.name || null,
        type: transaction.type,
        amount: transaction.amount || null,
        price: transaction.price || null,
        quantity: transaction.quantity || null,
        fees: transaction.fees || null,
        date: transaction.date,
        isoCurrencyCode: transaction.isoCurrencyCode || null,
      };
      
      await storage.createPlaidInvestmentTransaction(plaidTransaction);
    }
  } catch (error) {
    console.error('Error storing transactions:', error);
    throw new Error(`Failed to store transactions: ${error.message}`);
  }
}