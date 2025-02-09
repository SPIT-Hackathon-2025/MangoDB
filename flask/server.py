from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import pandas as pd
import faiss
import numpy as np

app = Flask(__name__)

# Initialize components
df = pd.read_csv("lostAndFoun.csv")
encoder = SentenceTransformer("all-mpnet-base-v2")

# Create search index
vectors = encoder.encode(df.Description)
index = faiss.IndexFlatL2(vectors.shape[1])
index.add(vectors)

@app.route('/query', methods=['POST'])
def search():
    try:
        query = request.get_json().get('query')
        if not query:
            return jsonify({"error": "Query is required"}), 400
            
        # Search top 2 similar items
        query_vector = encoder.encode(query).reshape(1, -1)
        distances, indices = index.search(query_vector, k=2)
        
        # Prepare results
        results = [
            {
                "match": df.loc[idx].to_dict()
                # "distance": float(dist)
            }
            for dist, idx in sorted(zip(distances[0], indices[0]), key=lambda x: x[0])  # Sort by distance
        ]
        
        return jsonify({"matches": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5002)
