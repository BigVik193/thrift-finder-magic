from flask import Flask, request, jsonify
from flask_cors import CORS
from text_generation import Client
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "ngrok-skip-browser-warning"]}})

# Get API token from environment
API_TOKEN = os.getenv("HUGGINGFACE_API_KEY")
if not API_TOKEN:
    raise ValueError("HUGGINGFACE_API_KEY environment variable not set")

# Initialize the client
client = Client(
    base_url="https://api-inference.huggingface.co/models/HuggingFaceM4/idefics-9b-instruct",
    headers={"x-use-cache": "0", "Authorization": f"Bearer {API_TOKEN}"},
)

@app.route("/generate", methods=["POST"])
def generate():
    try:
        data = request.json
        
        if not data or "image_base64" not in data:
            return jsonify({"error": "Missing image_base64 in request"}), 400
        
        image_base64 = data["image_base64"]
        
        # Ensure we have clean base64 by removing header if present
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        prompt = (
            "User: Describe the clothing item in the image and respond with format: "
            "'<Type>: <Description>'. Type must be one of: Tops, Bottoms, Outerwear, "
            "Footwear, or Other. Description should describe the clothing item in detail. "
            f"![](data:image/jpeg;base64,{image_base64})<end_of_utterance>\nAssistant:"
        )

        print("\n[generate] Prompt Sent to IDEFICS:")
        print(prompt[:500] + '...')  # Truncate for readability

        generation_args = {
            "max_new_tokens": 300,
            "repetition_penalty": 1.0,
            "do_sample": False,
            "stop_sequences": ["<end_of_utterance>", "\nUser:"],
        }

        generated_text = client.generate(prompt=prompt, **generation_args)

        print("\n[generate] IDEFICS Output:")
        print(generated_text)

        return jsonify({
            "success": True,
            "generated_text": generated_text
        })
    
    except Exception as e:
        print(f"[generate] Error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5050))
    print(f"Running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)