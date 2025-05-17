/**
 * Plaid Controller for API endpoints
 */
import express from 'express';
import { isAuthenticated } from '../../replitAuth';
import { createLinkToken, exchangePublicToken, fetchInvestmentHoldings, fetchInvestmentTransactions } from './plaid-client';
import { storage } from '../../storage';

const router = express.Router();

// Ensure all routes are protected by authentication
router.use(isAuthenticated);

/**
 * Generate a Plaid Link token to initiate the OAuth flow
 */
router.get('/link-token', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User ID not found in session' 
      });
    }
    
    const linkToken = await createLinkToken(userId);
    
    return res.json({ link_token: linkToken });
  } catch (error) {
    console.error('Error creating link token:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

/**
 * Exchange the public token from Plaid for an access token
 */
router.post('/exchange-public-token', async (req: any, res) => {
  try {
    const { publicToken, institutionId, institutionName } = req.body;
    const userId = req.user.claims.sub;
    
    if (!publicToken || !institutionId || !institutionName) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Public token, institution ID, and institution name are required' 
      });
    }

    const accessToken = await exchangePublicToken(
      userId,
      publicToken,
      institutionId,
      institutionName
    );
    
    return res.json({
      success: true,
      message: 'Successfully linked account'
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

/**
 * Get all investment holdings for the current user
 */
router.get('/holdings', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Check if the user has any linked accounts
    const plaidItems = await storage.getPlaidItemsByUserId(userId);
    
    if (!plaidItems || plaidItems.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No linked investment accounts found'
      });
    }
    
    // Fetch investment holdings from Plaid
    const holdings = await fetchInvestmentHoldings(userId);
    
    return res.json(holdings);
  } catch (error) {
    console.error('Error fetching investment holdings:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

/**
 * Get investment transactions for the current user
 */
router.get('/transactions', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Parse date parameters, default to last 30 days if not provided
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    if (req.query.start_date) {
      startDate.setTime(Date.parse(req.query.start_date));
    }
    
    if (req.query.end_date) {
      endDate.setTime(Date.parse(req.query.end_date));
    }
    
    // Check if the user has any linked accounts
    const plaidItems = await storage.getPlaidItemsByUserId(userId);
    
    if (!plaidItems || plaidItems.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No linked investment accounts found'
      });
    }
    
    // Fetch investment transactions from Plaid
    const transactions = await fetchInvestmentTransactions(userId, startDate, endDate);
    
    return res.json(transactions);
  } catch (error) {
    console.error('Error fetching investment transactions:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

/**
 * Get all linked accounts for the current user
 */
router.get('/accounts', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Get all items for the user
    const items = await storage.getPlaidItemsByUserId(userId);
    
    if (!items || items.length === 0) {
      return res.json([]);
    }
    
    // For each item, get the accounts
    const accountPromises = items.map(item => storage.getPlaidAccountsByItemId(item.id));
    const accountsArrays = await Promise.all(accountPromises);
    
    // Flatten the array of account arrays
    const accounts = accountsArrays.flat();
    
    // Format the response
    const formattedAccounts = accounts.map(account => ({
      id: account.id,
      name: account.name,
      mask: account.mask,
      type: account.type,
      subtype: account.subtype,
      institution: items.find(item => item.id === account.plaidItemId)?.institutionName || 'Unknown',
    }));
    
    return res.json(formattedAccounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

/**
 * Remove a linked account
 */
router.delete('/items/:itemId', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const itemId = parseInt(req.params.itemId);
    
    if (isNaN(itemId)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid item ID'
      });
    }
    
    // Verify the item belongs to the user
    const item = await storage.getPlaidItemById(itemId);
    
    if (!item || item.userId !== userId) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Item not found or does not belong to the user'
      });
    }
    
    // Delete the item (this should cascade to accounts, holdings, and transactions)
    await storage.deletePlaidItem(itemId);
    
    return res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
});

export default router;