
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.0'

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
    // Get Supabase configuration from environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration is missing');
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Parse the request body
    const { item, userId } = await req.json();

    if (!item) {
      return new Response(JSON.stringify({
        error: 'Item data is required',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if the listing already exists
    const { data: existingListing } = await supabase
      .from('listings')
      .select('id')
      .eq('id', item.id)
      .maybeSingle();

    if (!existingListing) {
      // Insert the listing if it doesn't exist
      const { error: insertError } = await supabase
        .from('listings')
        .insert({
          id: item.id,
          title: item.title,
          price: item.price,
          currency: item.currency,
          image: item.image,
          platform: item.platform,
          seller_username: item.seller_username,
          seller_feedback_percentage: item.seller_feedback_percentage,
          seller_feedback_score: item.seller_feedback_score,
          condition: item.condition,
          url: item.url
        });

      if (insertError) {
        throw new Error(`Error inserting listing: ${insertError.message}`);
      }
    }

    // If userId is provided, save the item for the user
    if (userId) {
      // Check if the item is already saved by the user
      const { data: existingSave } = await supabase
        .from('saved_items')
        .select('user_id, listing_id')
        .eq('user_id', userId)
        .eq('listing_id', item.id)
        .maybeSingle();

      if (!existingSave) {
        // Save the item if it's not already saved
        const { error: saveError } = await supabase
          .from('saved_items')
          .insert({
            user_id: userId,
            listing_id: item.id
          });

        if (saveError) {
          throw new Error(`Error saving item for user: ${saveError.message}`);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: userId ? 'Item saved successfully' : 'Item recorded successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in save-listing function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An unknown error occurred'
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
});
