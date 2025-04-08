import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { imageBase64, user_id } = await req.json();

        if (!imageBase64 || !user_id) {
            return new Response(
                JSON.stringify({ error: 'Missing imageBase64 or user_id' }),
                {
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                    },
                    status: 400,
                }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceRoleKey =
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';
        const FLASK_SERVER_URL =
            Deno.env.get('FLASK_SERVER_URL') ?? 'http://localhost:5000';

        if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1. Get or create wardrobe
        const { data: wardrobe, error: wardrobeError } = await supabase
            .from('wardrobes')
            .select('id')
            .eq('user_id', user_id)
            .single();

        let wardrobeId: string;
        if (wardrobeError) {
            const { data: newWardrobe, error: createError } = await supabase
                .from('wardrobes')
                .insert({ user_id })
                .select('id')
                .single();
            if (createError)
                throw new Error(
                    `Wardrobe creation failed: ${createError.message}`
                );
            wardrobeId = newWardrobe.id;
        } else {
            wardrobeId = wardrobe.id;
        }

        // 2. Upload image
        const timestamp = Date.now();
        const fileName = `${user_id}/upload/${timestamp}.jpg`;
        const base64Str = imageBase64.split(',')[1] || imageBase64;
        const binary = atob(base64Str);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('wardrobe-uploads')
            .upload(fileName, bytes, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (uploadError)
            throw new Error(`Image upload failed: ${uploadError.message}`);

        // 3. Generate signed URL (still needed for database storage)
        const { data: urlData } = await supabase.storage
            .from('wardrobe-uploads')
            .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

        const imageUrl = urlData.signedUrl;

        // 4. Call Flask server with base64 image directly - FIX: Use the correct endpoint path
        const ideficsResponse = await fetch(
            `${FLASK_SERVER_URL}/api/test/generate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_base64: imageBase64,
                }),
            }
        );

        // Error handling for non-JSON responses
        const contentType = ideficsResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const responseText = await ideficsResponse.text();
            console.error('Non-JSON response from Flask server:', responseText);
            throw new Error(
                `Flask server returned non-JSON response: ${ideficsResponse.status} ${ideficsResponse.statusText}`
            );
        }

        const ideficsData = await ideficsResponse.json();

        if (!ideficsResponse.ok || !ideficsData.success) {
            console.error('IDEFICS API error:', ideficsData);
            throw new Error('Failed to get clothing description from IDEFICS');
        }

        const generatedText = ideficsData.generated_text.trim();

        // Parse the response to extract type and description
        let description: string;
        let clothingType:
            | 'Tops'
            | 'Bottoms'
            | 'Outerwear'
            | 'Footwear'
            | 'Other';

        try {
            // Look for the format "<Type>: <Description>"
            const formatMatch = generatedText.match(
                /^(Tops|Bottoms|Outerwear|Footwear|Other):\s*(.+)$/is
            );

            if (formatMatch) {
                // Extract type and description from the formatted response
                const extractedType = formatMatch[1].trim();
                description = formatMatch[2].trim();

                // Normalize the type to ensure exact match with our categories
                if (/^tops?$/i.test(extractedType)) clothingType = 'Tops';
                else if (/^bottoms?$/i.test(extractedType))
                    clothingType = 'Bottoms';
                else if (/^outerwear$/i.test(extractedType))
                    clothingType = 'Outerwear';
                else if (/^footwear$/i.test(extractedType))
                    clothingType = 'Footwear';
                else clothingType = 'Other';
            } else {
                // If we can't find the expected format, try to infer type and use rest as description
                const typeKeywords = {
                    Tops: [
                        'shirt',
                        'blouse',
                        't-shirt',
                        'top',
                        'sweater',
                        'tee',
                        'tank',
                    ],
                    Bottoms: [
                        'pants',
                        'jeans',
                        'shorts',
                        'skirt',
                        'trousers',
                        'leggings',
                    ],
                    Outerwear: [
                        'jacket',
                        'coat',
                        'hoodie',
                        'cardigan',
                        'blazer',
                        'vest',
                        'parka',
                    ],
                    Footwear: [
                        'shoes',
                        'boots',
                        'sneakers',
                        'sandals',
                        'heels',
                        'loafers',
                    ],
                };

                let foundType = 'Other';
                const lowerText = generatedText.toLowerCase();

                // Try to detect type based on keywords
                for (const [type, keywords] of Object.entries(typeKeywords)) {
                    if (
                        keywords.some((keyword) =>
                            lowerText.includes(keyword.toLowerCase())
                        )
                    ) {
                        foundType = type;
                        break;
                    }
                }

                clothingType = foundType as any;
                description = generatedText;
            }
        } catch (err) {
            console.error(
                'Failed to parse IDEFICS response:',
                err,
                generatedText
            );
            // Fallback values
            description = 'Clothing item';
            clothingType = 'Other';
        }

        // 5. Generate embedding
        const embeddingRes = await fetch(
            'https://api.openai.com/v1/embeddings',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: description,
                    model: OPENAI_EMBEDDING_MODEL,
                }),
            }
        );

        const embeddingData = await embeddingRes.json();
        if (!embeddingRes.ok || !embeddingData.data?.[0]?.embedding) {
            console.error('Embedding error:', embeddingData);
            throw new Error('Failed to get embedding');
        }

        const embedding = embeddingData.data[0].embedding;

        // 6. Insert into clothing_items
        const { data: clothingItem, error: insertError } = await supabase
            .from('clothing_items')
            .insert({
                wardrobe_id: wardrobeId,
                image_url: imageUrl,
                embedding,
                type: clothingType,
            })
            .select('*')
            .maybeSingle();

        if (insertError) {
            throw new Error(
                `Failed to insert clothing item: ${insertError.message}`
            );
        }

        // 7. Update user style vector
        try {
            const { error: vectorUpdateError } =
                await supabase.functions.invoke('update-user-style-vector', {
                    body: {
                        user_id,
                        clothing_item_id: clothingItem.id,
                    },
                });

            if (vectorUpdateError) {
                console.error(
                    'Error updating user style vector:',
                    vectorUpdateError
                );
            }
        } catch (err) {
            console.error('Failed to invoke update-user-style-vector:', err);
        }

        return new Response(
            JSON.stringify({
                success: true,
                wardrobeId,
                imageUrl,
                description,
                type: clothingType,
                embedding,
                clothingItem,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
