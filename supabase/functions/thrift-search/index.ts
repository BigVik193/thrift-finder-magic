
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// Define the schema for the response
interface ThriftSearchResponse {
  status: 'success' | 'error';
  recommended_searches: string[];
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
    // Parse the request body
    const { userQuery, userGender } = await req.json()

    // Validate input
    if (!userQuery) {
      return new Response(JSON.stringify({ 
        status: 'error',
        recommended_searches: [],
        error: 'User query is required'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Retrieve OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Construct the prompt
    const prompt = `Generate optimized thrift fashion search queries for online platforms like eBay from:  
**"${userQuery}"**
- Include key details (category, style, color, condition).
- If vague, infer intent and create effective searches. Be creative.
- Return **one or two** concise, diverse queries.
- If unrelated to fashion, return an error.
- User gender is ${userGender || 'unspecified'}
- Output as JSON:
{ "status": "success" | "error", "recommended_searches": ["search1", "search2"] };`

    // Make request to OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You optimize thrift clothing search queries by structuring them for better marketplace searches.'
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    })

    // Check for successful response
    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text()
      console.error('OpenAI API error:', errorBody)
      throw new Error(`OpenAI API error: ${errorBody}`)
    }

    // Parse the response
    const responseData = await openaiResponse.json()
    let result: ThriftSearchResponse

    try {
      // Try to parse the content as JSON
      result = JSON.parse(responseData.choices[0].message.content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', responseData.choices[0].message.content)
      // Fallback to a default response
      result = {
        status: 'error',
        recommended_searches: []
      }
    }

    // Return the processed result
    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Error processing query:', error)
    return new Response(JSON.stringify({ 
      status: 'error', 
      recommended_searches: [],
      error: error.message 
    }), { 
      status: 500,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
})
