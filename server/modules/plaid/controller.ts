import { Request, Response } from 'express';
import { storage } from '../../storage';
import { 
  createLinkToken, 
  exchangePublicToken, 
  getAccounts, 
  getInvestmentHoldings,
  getInstitutionById
} from './plaid-client';
import { formatDate } from '../../utils/date-utils';

// Generate a link token for the user to connect their accounts
export async function getLinkToken(req: Request, res: Response) {
  try {
    // Get the user ID from the authenticated session
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Create a link token for the user
    const linkToken = await createLinkToken(userId);
    
    res.json({ link_token: linkToken });
  } catch (error: any) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: error.message || 'Failed to create link token' });
  }
}

// Exchange a public token for an access token and store it
export async function exchangeToken(req: Request, res: Response) {
  try {
    const { publicToken, institutionId, institutionName } = req.body;
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!publicToken) {
      return res.status(400).json({ error: 'Public token is required' });
    }

    // Exchange public token for an access token
    const accessToken = await exchangePublicToken(publicToken);
    
    // Store the Plaid item in our database
    const plaidItem = await storage.createPlaidItem({
      userId,
      accessToken,
      institutionId,
      institutionName,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Get accounts for this item and store them
    const accountsData = await getAccounts(accessToken);
    
    for (const account of accountsData.accounts) {
      // Only store investment accounts
      if (account.type === 'investment') {
        await storage.createPlaidAccount({
          plaidItemId: plaidItem.id,
          plaidAccountId: account.account_id,
          name: account.name,
          mask: account.mask,
          type: account.type,
          subtype: account.subtype || null,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Get investment holdings
    await syncInvestmentHoldings(plaidItem.id, accessToken);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ error: error.message || 'Failed to exchange token' });
  }
}

// Sync investment holdings for an item
async function syncInvestmentHoldings(itemId: number, accessToken: string) {
  try {
    // Get accounts for this item
    const plaidAccounts = await storage.getPlaidAccountsByItemId(itemId);
    if (!plaidAccounts.length) return;

    // Get investment holdings data
    const holdingsData = await getInvestmentHoldings(accessToken);
    
    // Map of account_id to our database account id
    const accountMap = new Map(
      plaidAccounts.map(account => [account.plaidAccountId, account.id])
    );

    // Process holdings
    for (const holding of holdingsData.holdings) {
      const accountId = accountMap.get(holding.account_id);
      if (!accountId) continue; // Skip if account not found in our database
      
      // Get security details
      const security = holdingsData.securities.find(
        s => s.security_id === holding.security_id
      );
      
      if (!security) continue; // Skip if security not found

      // Store or update the holding
      await storage.createOrUpdatePlaidHolding({
        accountId,
        securityId: holding.security_id,
        symbol: security.ticker_symbol || 'UNKNOWN',
        name: security.name || 'Unknown Security',
        quantity: holding.quantity,
        costBasis: holding.cost_basis || null,
        currentPrice: security.close_price || null,
        currentValue: holding.institution_value || null,
        isoCurrencyCode: holding.iso_currency_code || 'USD',
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error syncing investment holdings:', error);
    throw new Error('Failed to sync investment holdings');
  }
}

// Get a user's connected accounts
export async function getConnectedAccounts(req: Request, res: Response) {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get all Plaid items for this user
    const items = await storage.getPlaidItemsByUserId(userId);
    
    // Map to get accounts for each item
    const accountsPromises = items.map(async (item) => {
      const accounts = await storage.getPlaidAccountsByItemId(item.id);
      return accounts.map(account => ({
        id: account.id,
        name: account.name,
        mask: account.mask,
        type: account.type,
        subtype: account.subtype,
        institution: item.institutionName,
      }));
    });

    const accountsArrays = await Promise.all(accountsPromises);
    const accounts = accountsArrays.flat();

    res.json(accounts);
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch accounts' });
  }
}

// Get a user's investment holdings
export async function getInvestmentHoldingsForUser(req: Request, res: Response) {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get all Plaid items for this user
    const items = await storage.getPlaidItemsByUserId(userId);
    if (items.length === 0) {
      return res.json([]);
    }
    
    // Get all accounts for these items
    const accountIds = [];
    for (const item of items) {
      const accounts = await storage.getPlaidAccountsByItemId(item.id);
      accountIds.push(...accounts.map(a => a.id));
    }

    if (accountIds.length === 0) {
      return res.json([]);
    }

    // Get holdings for all accounts
    const holdings = [];
    for (const accountId of accountIds) {
      const accountHoldings = await storage.getPlaidHoldingsByAccountId(accountId);
      holdings.push(...accountHoldings);
    }

    res.json(holdings);
  } catch (error: any) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch holdings' });
  }
}

// Delete a Plaid connection (item)
export async function deletePlaidItem(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get the item to ensure it belongs to this user
    const item = await storage.getPlaidItemById(parseInt(itemId));
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    if (item.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to this item' });
    }

    // Delete the item
    await storage.deletePlaidItem(parseInt(itemId));
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting Plaid item:', error);
    res.status(500).json({ error: error.message || 'Failed to delete Plaid item' });
  }
}