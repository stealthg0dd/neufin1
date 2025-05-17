import { Router, Request, Response } from 'express';
import { 
  createLinkToken, 
  exchangePublicToken, 
  getInvestmentHoldings, 
  getAccounts,
  getInstitutionById
} from './plaid-client';
import { storage } from '../../storage';
import { formatDateForPlaid, formatDateForDisplay } from '../../utils/date-utils';

const router = Router();

// Get a link token for initializing Plaid Link
export async function getLinkToken(req: Request, res: Response) {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const linkToken = await createLinkToken(userId);
    res.json({ link_token: linkToken });
  } catch (error: any) {
    console.error('Error getting link token:', error);
    res.status(500).json({ error: error.message });
  }
}

// Exchange a public token for an access token and store it
export async function exchangeToken(req: Request, res: Response) {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { public_token, metadata } = req.body;
    
    if (!public_token) {
      return res.status(400).json({ error: 'Public token is required' });
    }

    // Exchange the public token for an access token
    const accessToken = await exchangePublicToken(public_token);
    
    // Get institution details
    const institutionId = metadata?.institution?.institution_id;
    let institutionName = metadata?.institution?.name || 'Unknown Institution';
    
    if (institutionId) {
      try {
        const institution = await getInstitutionById(institutionId);
        institutionName = institution.name;
      } catch (error) {
        console.error('Error fetching institution details:', error);
      }
    }
    
    // Store the Plaid item in the database
    const plaidItem = await storage.createPlaidItem({
      userId,
      accessToken,
      itemId: metadata.item_id,
      institutionId,
      institutionName,
      status: 'active'
    });
    
    // Sync accounts and holdings
    await syncAccountsAndHoldings(plaidItem.id, accessToken);
    
    res.json({ success: true, institutionName });
  } catch (error: any) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get all connected accounts for the user
export async function getConnectedAccounts(req: Request, res: Response) {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get all Plaid items for the user
    const plaidItems = await storage.getPlaidItemsByUserId(userId);
    
    // For each item, get its accounts
    const accounts = [];
    for (const item of plaidItems) {
      const itemAccounts = await storage.getPlaidAccountsByItemId(item.id);
      
      // Add institution name to each account
      const accountsWithInstitution = itemAccounts.map(account => ({
        ...account,
        institutionName: item.institutionName
      }));
      
      accounts.push(...accountsWithInstitution);
    }
    
    res.json(accounts);
  } catch (error: any) {
    console.error('Error fetching connected accounts:', error);
    res.status(500).json({ error: error.message });
  }
}

// Get investment holdings for all user accounts
export async function getInvestmentHoldingsForUser(req: Request, res: Response) {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get all Plaid access tokens for the user
    const accessTokens = await storage.getPlaidAccessTokensByUserId(userId);
    
    // Get all accounts for the user
    const plaidItems = await storage.getPlaidItemsByUserId(userId);
    
    const allHoldings = [];
    for (const item of plaidItems) {
      const accounts = await storage.getPlaidAccountsByItemId(item.id);
      
      // Only include investment accounts
      const investmentAccounts = accounts.filter(account => account.type === 'investment');
      
      for (const account of investmentAccounts) {
        const holdings = await storage.getPlaidHoldingsByAccountId(account.id);
        
        // Add account and institution info to each holding
        const holdingsWithInfo = holdings.map(holding => ({
          ...holding,
          accountName: account.name,
          institutionName: item.institutionName
        }));
        
        allHoldings.push(...holdingsWithInfo);
      }
    }
    
    res.json(allHoldings);
  } catch (error: any) {
    console.error('Error fetching investment holdings:', error);
    res.status(500).json({ error: error.message });
  }
}

// Delete a Plaid item and all associated data
export async function deletePlaidItem(req: Request, res: Response) {
  try {
    const userId = req.user?.claims?.sub;
    const itemId = parseInt(req.params.itemId);
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (isNaN(itemId)) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }
    
    // Verify the item belongs to the user
    const item = await storage.getPlaidItemById(itemId);
    if (!item || item.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }
    
    // Delete the item
    await storage.deletePlaidItem(itemId);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting Plaid item:', error);
    res.status(500).json({ error: error.message });
  }
}

// Helper function to sync accounts and investment holdings for a Plaid item
async function syncAccountsAndHoldings(itemId: number, accessToken: string) {
  try {
    // Get accounts from Plaid
    const accountsResponse = await getAccounts(accessToken);
    
    // Store each account in the database
    for (const account of accountsResponse.accounts) {
      const savedAccount = await storage.createPlaidAccount({
        plaidItemId: itemId,
        accountId: account.account_id,
        name: account.name,
        mask: account.mask,
        officialName: account.official_name,
        type: account.type,
        subtype: account.subtype,
        status: 'active'
      });
      
      // If it's an investment account, sync holdings
      if (account.type === 'investment') {
        await syncInvestmentHoldings(savedAccount.id, accessToken);
      }
    }
  } catch (error: any) {
    console.error('Error syncing accounts and holdings:', error);
    throw new Error(`Failed to sync accounts: ${error.message}`);
  }
}

// Helper function to sync investment holdings for an account
async function syncInvestmentHoldings(accountId: number, accessToken: string) {
  try {
    // Get holdings from Plaid
    const holdingsResponse = await getInvestmentHoldings(accessToken);
    
    // Find the Plaid account
    const account = await storage.getPlaidAccountById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }
    
    // Find holdings that match this account
    const accountHoldings = holdingsResponse.holdings.filter(
      holding => holding.account_id === account.accountId
    );
    
    // Get securities map for additional details
    const securitiesMap = holdingsResponse.securities.reduce<Record<string, any>>((map, security) => {
      map[security.security_id] = security;
      return map;
    }, {});
    
    // Store each holding in the database
    for (const holding of accountHoldings) {
      const security = securitiesMap[holding.security_id] || {};
      
      await storage.createOrUpdatePlaidHolding({
        accountId,
        securityId: holding.security_id,
        symbol: security.ticker_symbol,
        name: security.name,
        quantity: holding.quantity,
        costBasis: holding.cost_basis,
        institutionPrice: holding.institution_price,
        institutionValue: holding.institution_value,
        isoCurrencyCode: holding.iso_currency_code,
        unofficialCurrencyCode: holding.unofficial_currency_code
      });
    }
  } catch (error: any) {
    console.error('Error syncing investment holdings:', error);
    throw new Error(`Failed to sync holdings: ${error.message}`);
  }
}

export default router;