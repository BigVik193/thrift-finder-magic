
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Define interfaces for API responses
interface EbayItem {
  itemId: string;
  title: string;
  price: {
    value: number;
    currency: string;
  };
  image: {
    imageUrl: string;
  };
  seller: {
    username: string;
    feedbackPercentage: string;
    feedbackScore: number;
  };
  condition: string;
  itemWebUrl: string;
}

interface ListingItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  platform: 'ebay';
  seller_username: string;
  seller_feedback_percentage: string;
  seller_feedback_score: number;
  condition: string;
  url: string;
}

// Serve the edge function
serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, Content-Type, apikey',
  }

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('OK', { headers: corsHeaders })
  }

  // Ensure it's a POST request
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ 
      error: 'Method Not Allowed' 
    }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    // Get eBay configuration from environment variables
    const EBAY_SEARCH_URL = Deno.env.get('EBAY_SEARCH_URL');
    const EBAY_AUTH = Deno.env.get('EBAY_AUTH');
    
    if (!EBAY_SEARCH_URL || !EBAY_AUTH) {
      throw new Error('eBay API configuration is missing');
    }

    // Parse the request body
    const { searchTerms } = await req.json();

    if (!searchTerms || !Array.isArray(searchTerms) || searchTerms.length === 0) {
      return new Response(JSON.stringify({
        error: 'Search terms are required and must be an array',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch listings for each search term
    const allResults: ListingItem[] = [];
    
    for (const term of searchTerms) {
      console.log(`Processing search term: ${term}`);
      
      try {
        const response = await fetch(`${EBAY_SEARCH_URL}?q=${encodeURIComponent(term)}&limit=20`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${EBAY_AUTH}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`eBay API error for term "${term}":`, errorText);
          continue; // Skip this term but continue with others
        }

        const data = await response.json();
        const items = data.itemSummaries || [];

        // Transform eBay items to our listing format
        const transformedItems = items.map((item: EbayItem) => ({
          id: item.itemId,
          title: item.title,
          price: item.price.value,
          currency: item.price.currency,
          image: item.image?.imageUrl || '',
          platform: 'ebay' as const,
          seller_username: item.seller?.username || 'Unknown Seller',
          seller_feedback_percentage: item.seller?.feedbackPercentage || 'N/A',
          seller_feedback_score: item.seller?.feedbackScore || 0,
          condition: item.condition || 'Not specified',
          url: item.itemWebUrl,
        }));

        allResults.push(...transformedItems);
      } catch (error) {
        console.error(`Error processing search term "${term}":`, error);
        // Continue with other terms
      }
    }

    // Remove duplicates based on itemId
    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.id, item])).values()
    );

    return new Response(JSON.stringify({ 
      items: uniqueResults,
      count: uniqueResults.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ebay-search function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unknown error occurred'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
});
