from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

# NOTE: FAISS MODULE
# Load data
df = pd.read_csv("govtTest.csv")

# Load the model once
encoder = SentenceTransformer("all-mpnet-base-v2")

# Encode dataset
vectors = encoder.encode(df.text)
dim = vectors.shape[1]

# Initialize FAISS index
index = faiss.IndexFlatL2(dim)
index.add(vectors)

@app.route('/query', methods=['POST'])
def search():
    try:
        data = request.get_json()
        search_query = data.get('query', '')

        if not search_query:
            return jsonify({"error": "Query is required"}), 400

        # Encode query
        vec = encoder.encode(search_query)
        svec = np.array(vec).reshape(1, -1)

        # Search FAISS index
        distances, I = index.search(svec, k=2)

        # Get matching results
        results = df.loc[I[0]].to_dict(orient="records")
        return jsonify({"matches": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
