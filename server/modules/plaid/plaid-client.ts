import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

// Create a Plaid client with the appropriate credentials
// For sandbox environment, we'll use test credentials
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
      'PLAID-SECRET': process.env.PLAID_SECRET || '',
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

// Function to create a link token for a user
export async function createLinkToken(userId: string): Promise<string> {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'Neufin',
      products: [Products.Investments, Products.Auth],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return response.data.link_token;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw new Error('Failed to create link token');
  }
}

// Function to exchange a public token for an access token
export async function exchangePublicToken(publicToken: string): Promise<string> {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw new Error('Failed to exchange public token');
  }
}

// Function to retrieve investment holdings for an account
export async function getInvestmentHoldings(accessToken: string) {
  try {
    const response = await plaidClient.investmentsHoldingsGet({
      access_token: accessToken,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching investment holdings:', error);
    throw new Error('Failed to fetch investment holdings');
  }
}

// Function to retrieve accounts for an item
export async function getAccounts(accessToken: string) {
  try {
    const response = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw new Error('Failed to fetch accounts');
  }
}

// Function to retrieve investment transactions for an account
export async function getInvestmentTransactions(
  accessToken: string,
  startDate: string,
  endDate: string
) {
  try {
    const response = await plaidClient.investmentsTransactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching investment transactions:', error);
    throw new Error('Failed to fetch investment transactions');
  }
}

// Function to retrieve institution details
export async function getInstitutionById(institutionId: string) {
  try {
    const response = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
    });

    return response.data.institution;
  } catch (error) {
    console.error('Error fetching institution details:', error);
    throw new Error('Failed to fetch institution details');
  }
}