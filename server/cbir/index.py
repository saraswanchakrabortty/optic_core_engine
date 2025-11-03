import os
import faiss
import numpy as np
from cbir.utils import extract_vector

IMAGE_DB = "./cbir/image_db"
INDEX_FILE = "./cbir/image_index.faiss"
VECTOR_DIM = 1000  # From ResNet50

def build_index():
    index = faiss.IndexFlatL2(VECTOR_DIM)
    image_paths = []

    for fname in os.listdir(IMAGE_DB):
        if not fname.lower().endswith((".jpg", ".jpeg", ".png")):
            continue
        path = os.path.join(IMAGE_DB, fname)
        vec = extract_vector(path).numpy()
        index.add(vec.reshape(1, -1))
        image_paths.append(path)

    faiss.write_index(index, INDEX_FILE)
    with open(INDEX_FILE + ".paths", "w") as f:
        for path in image_paths:
            f.write(path + "\n")

    print(f"✅ Indexed {len(image_paths)} images.")

def search_similar(image_path: str, top_k: int = 12):
    index = faiss.read_index(INDEX_FILE)
    with open(INDEX_FILE + ".paths") as f:
        image_paths = f.read().splitlines()

    query_vec = extract_vector(image_path).numpy().reshape(1, -1)
    distances, indices = index.search(query_vec, top_k)

    results = [image_paths[i] for i in indices[0]]
    return results
