// idefics-test.ts - A standalone script to test IDEFICS image captioning

import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

if (!HUGGINGFACE_API_KEY) {
    console.error(
        'Error: HUGGINGFACE_API_KEY is required. Please add it to your .env file.'
    );
    process.exit(1);
}

async function testIdeficsImageCaptioning(imagePath: string) {
    try {
        console.log(`Reading image from: ${imagePath}`);

        // Read image file and convert to base64
        const imageBuffer = readFileSync(imagePath);
        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString(
            'base64'
        )}`;

        console.log('Image loaded and converted to base64');
        console.log('Sending request to IDEFICS API...');

        // Construct the prompt
        const prompt =
            "Look at this clothing item and respond in this exact format: '<Type>: <Description>'. The Type must be exactly one of these: Tops, Bottoms, Outerwear, Footwear, or Other. The Description should be detailed and mention color, material, style, and other relevant details.";

        // Call the IDEFICS API
        const response = await fetch(
            'https://api-inference.huggingface.co/models/HuggingFaceM4/idefics-9b',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: {
                        text: prompt,
                        image: base64Image,
                    },
                    parameters: {
                        max_new_tokens: 300,
                        temperature: 0.2,
                        top_p: 0.9,
                    },
                }),
            }
        );

        // Parse the response
        const data = await response.json();

        if (!response.ok) {
            console.error('API Error:', data);
            return;
        }

        console.log('\n=== Raw API Response ===');
        console.log(JSON.stringify(data, null, 2));

        if (!data.generated_text) {
            console.error('No generated text in response');
            return;
        }

        // Parse the generated text to extract type and description
        const generatedText = data.generated_text.trim();
        console.log('\n=== Generated Text ===');
        console.log(generatedText);

        // Try to parse using the expected format
        const formatMatch = generatedText.match(
            /^(Tops|Bottoms|Outerwear|Footwear|Other):\s*(.+)$/is
        );

        if (formatMatch) {
            const extractedType = formatMatch[1].trim();
            const description = formatMatch[2].trim();

            console.log('\n=== Parsed Result ===');
            console.log(`Type: ${extractedType}`);
            console.log(`Description: ${description}`);
        } else {
            console.log('\n=== Could not parse in expected format ===');

            // Try to infer type
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

            console.log('\n=== Inferred Result ===');
            console.log(`Inferred Type: ${foundType}`);
            console.log(`Using full text as description`);
        }
    } catch (error) {
        console.error('Error in test script:', error);
    }
}

// Check for image path argument
const imagePath = process.argv[2];
if (!imagePath) {
    console.error('Please provide an image path as an argument');
    console.error('Example: npx ts-node idefics-test.ts ./path/to/image.jpg');
    process.exit(1);
}

// Run the test
testIdeficsImageCaptioning(imagePath);
