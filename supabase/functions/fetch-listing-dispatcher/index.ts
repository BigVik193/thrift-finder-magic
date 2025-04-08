import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
        'Authorization, X-Client-Info, Content-Type, apikey',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('OK', { headers: corsHeaders });
    }

    try {
        // Get environment variables
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
            'SUPABASE_SERVICE_ROLE_KEY'
        );

        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('Required environment variables are missing');
        }

        // Initialize Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Count how many active search terms we have
        const { count, error: countError } = await supabase
            .from('daily_search_terms')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        if (countError) {
            throw new Error(
                `Error counting search terms: ${countError.message}`
            );
        }

        if (!count || count === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'No active search terms found',
                }),
                {
                    status: 404,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Create a batch ID for this run - using date to make it human-readable
        const batchId = `fetch-${new Date().toISOString().split('T')[0]}`;

        // Create status record for this batch
        const { data: statusRecord, error: statusError } = await supabase
            .from('daily_fetch_status')
            .insert({
                batch_id: batchId,
                term_count: count,
                terms_processed: 0,
                status: 'in_progress',
            })
            .select()
            .single();

        if (statusError) {
            throw new Error(
                `Error creating status record: ${statusError.message}`
            );
        }

        // Start processing by invoking the processor with the first term
        await supabase.functions.invoke('process-listing-term', {
            body: {
                batchId: statusRecord.id,
                continueProcessing: true,
            },
        });

        return new Response(
            JSON.stringify({
                success: true,
                message: `Started processing ${count} search terms`,
                batchId: statusRecord.id,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error in fetch-listing-dispatcher function:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || 'An unknown error occurred',
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
