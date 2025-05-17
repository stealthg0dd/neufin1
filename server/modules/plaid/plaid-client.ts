import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { formatDate, getDaysAgo, getToday } from '../../utils/date-utils';

// Configure Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox, // Use sandbox for development
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

// Initialize Plaid API client
export const plaidClient = new PlaidApi(configuration);

/**
 * Create a link token for a user to initialize Plaid Link
 * @param userId User ID to associate with the link
 * @returns Link token to initialize Plaid Link
 */
export async function createLinkToken(userId: string): Promise<string> {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'Neufin Finance',
      products: [Products.Investments],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return response.data.link_token;
  } catch (error: any) {
    console.error('Error creating link token:', error);
    throw new Error(`Failed to create link token: ${error.message}`);
  }
}

/**
 * Exchange a public token for an access token
 * @param publicToken Public token from Plaid Link
 * @returns Access token to use with Plaid API
 */
export async function exchangePublicToken(publicToken: string): Promise<string> {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    return response.data.access_token;
  } catch (error: any) {
    console.error('Error exchanging public token:', error);
    throw new Error(`Failed to exchange token: ${error.message}`);
  }
}

/**
 * Get investment holdings for an account
 * @param accessToken Access token for the Plaid item
 * @returns Investment holdings data
 */
export async function getInvestmentHoldings(accessToken: string) {
  try {
    const response = await plaidClient.investmentsHoldingsGet({
      access_token: accessToken,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching investment holdings:', error);
    throw new Error(`Failed to fetch holdings: ${error.message}`);
  }
}

/**
 * Get accounts for a Plaid item
 * @param accessToken Access token for the Plaid item
 * @returns Accounts data
 */
export async function getAccounts(accessToken: string) {
  try {
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw new Error(`Failed to fetch accounts: ${error.message}`);
  }
}

/**
 * Get investment transactions for an account
 * @param accessToken Access token for the Plaid item
 * @param startDate Start date for transactions
 * @param endDate End date for transactions
 * @returns Investment transactions data
 */
export async function getInvestmentTransactions(
  accessToken: string,
  startDate: Date = getDaysAgo(30),
  endDate: Date = getToday()
) {
  try {
    const response = await plaidClient.investmentsTransactionsGet({
      access_token: accessToken,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching investment transactions:', error);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }
}

/**
 * Get institution details by ID
 * @param institutionId Institution ID from Plaid
 * @returns Institution details
 */
export async function getInstitutionById(institutionId: string) {
  try {
    const response = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
    });

    return response.data.institution;
  } catch (error) {
    console.error('Error fetching institution:', error);
    throw new Error(`Failed to fetch institution: ${error.message}`);
  }
}