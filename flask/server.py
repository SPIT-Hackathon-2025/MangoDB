# NOTE REDUNDANT

import torch
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
from flask import Flask, request, jsonify
import osx

app = Flask(__name__)

# Disable parallel processing to prevent semaphore leaks


# Load BLIP model once
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

@app.route('/generate_caption', methods=['POST'])
def generate_caption():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify({'error': 'Empty file name'}), 400

    try:
        # Load and process the image
        image = Image.open(image_file).convert("RGB")
        inputs = processor(image, return_tensors="pt")

        # Generate description
        with torch.no_grad():
            output = model.generate(**inputs)

        # Decode output
        description = processor.decode(output[0], skip_special_tokens=True)
        return jsonify({'description': description})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5003)
