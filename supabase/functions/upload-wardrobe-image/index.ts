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
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
        const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';

        if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

        // 3. Generate signed URL
        const { data: urlData } = await supabase.storage
            .from('wardrobe-uploads')
            .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

        const imageUrl = urlData.signedUrl;

        // 4. Describe image using GPT-4 Vision
        const visionRes = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4-vision-preview',
                    messages: [
                        {
                            role: 'system',
                            content:
                                'You are a fashion expert. Describe the clothing item in this image using detailed, objective language.',
                        },
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'image_url',
                                    image_url: { url: imageUrl },
                                },
                                {
                                    type: 'text',
                                    text: 'Please describe this item for use in a fashion embedding system.',
                                },
                            ],
                        },
                    ],
                    max_tokens: 300,
                }),
            }
        );

        const visionData = await visionRes.json();
        if (!visionRes.ok || !visionData.choices?.[0]?.message?.content) {
            console.error('GPT-4 Vision error:', visionData);
            throw new Error('Failed to get clothing description from GPT-4');
        }

        const description = visionData.choices[0].message.content;

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
            })
            .select('*')
            .maybeSingle();

        if (insertError) {
            throw new Error(
                `Failed to insert clothing item: ${insertError.message}`
            );
        }

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
