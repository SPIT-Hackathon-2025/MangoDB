from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import pandas as pd
import faiss
import numpy as np

app = Flask(__name__)

# Initialize components
df = pd.read_csv("govtTest.csv")
encoder = SentenceTransformer("all-mpnet-base-v2")

# Create search index
vectors = encoder.encode(df.text)
index = faiss.IndexFlatL2(vectors.shape[1])
index.add(vectors)

@app.route('/query', methods=['POST'])
def search():
    try:
        query = request.get_json().get('query')
        if not query:
            return jsonify({"error": "Query is required"}), 400
            
        # Search similar items
        query_vector = encoder.encode(query).reshape(1, -1)
        _, indices = index.search(query_vector, k=2)
        
        return jsonify({"matches": df.loc[indices[0]].to_dict(orient="records")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001)