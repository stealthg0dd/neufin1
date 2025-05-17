import { QueryClient } from '@tanstack/react-query';

/**
 * Default API request function that handles common request patterns
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint URL
 * @param {object} body - Request body (for POST, PUT, PATCH)
 * @returns {Promise} - Fetch promise
 */
export async function apiRequest(method, url, body) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  return fetch(url, options);
}

/**
 * Default fetcher for React Query that uses GET method
 * @param {string} url - API endpoint URL
 * @returns {Promise} - JSON response
 */
export async function defaultFetcher(url) {
  const response = await fetch(url, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
      queryFn: ({ queryKey }) => defaultFetcher(queryKey[0]),
    },
  },
});