import { Router } from 'express';
import { 
  getLinkToken, 
  exchangeToken, 
  getConnectedAccounts, 
  getInvestmentHoldingsForUser,
  deletePlaidItem 
} from './controller';
import { isAuthenticated } from '../../replitAuth';

const router = Router();

// All Plaid routes should be protected by authentication
router.get('/link-token', isAuthenticated, getLinkToken);
router.post('/exchange-public-token', isAuthenticated, exchangeToken);
router.get('/accounts', isAuthenticated, getConnectedAccounts);
router.get('/holdings', isAuthenticated, getInvestmentHoldingsForUser);
router.delete('/items/:itemId', isAuthenticated, deletePlaidItem);

export default router;