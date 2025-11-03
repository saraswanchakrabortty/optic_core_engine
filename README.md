# 🔮 Optic Core Engine (Self-Improving CBIR + Stable Diffusion)

**Optic Core Engine** is an AI-driven, **self-improving Content-Based Image Retrieval (CBIR)** system integrated with **Stable Diffusion** for intelligent image generation.  
It continuously evolves by learning from newly generated images — each text-to-image generation enriches its visual database, making future searches more accurate and diverse.

---

## ⚙️ Features

- 🧠 **Self-Improving CBIR System:** Every AI-generated image is automatically indexed, allowing the retrieval engine to grow smarter with each use.  
- 🎨 **Text-to-Image Generation:** Powered by **Stable Diffusion v1.5**, capable of producing detailed, photorealistic visuals.  
- 🪄 **ResNet-50 Feature Extraction:** Extracts deep visual embeddings to represent image content efficiently.  
- ⚡ **FAISS-Based Similarity Search:** Enables fast and accurate nearest-neighbor queries over thousands of images.  
- 🔗 **Seamless Integration:** Newly generated images are dynamically added to the CBIR image database.  
- 🌐 **Full-Stack AI Infrastructure:** Built using **FastAPI** (backend) and **React** (frontend) for real-time interactivity.  
- 🔍 **Instant Visual Search:** Upload an image and retrieve visually similar ones within seconds.
- 🚀 **GPU Acceleration:** Utilizes CUDA or MPS for real-time inference and fast vector computations.

---

## 🧠 Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React (Vite), Tailwind CSS |
| **Backend** | FastAPI, Python |
| **AI Models** | Stable Diffusion v1.5, ResNet-50 |
| **Vector Search Engine** | FAISS |
| **Dependencies** | Torch, Transformers, Diffusers, Pillow, Python-Multipart |

---

## 🧾 Example Workflow

1. ✏️ User enters a **text prompt** — the system generates a new image using **Stable Diffusion**.  
2. 🖼️ The generated image is **automatically indexed** in the CBIR database using **ResNet-50 embeddings**.  
3. 🔍 User uploads any image — the engine searches and returns **visually similar results** from the continuously growing dataset.

---

## ⚡ API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/generate-image` | Generate an image using Stable Diffusion |
| `POST` | `/cbir/search` | Upload an image and find similar images |
| `POST` | `/cbir/build-index` | Rebuild or refresh the image similarity index |

---

## 🧑‍💻 Setup & Run the project:

**Refer to the setup.txt file in project root.**

---

## 🛠️ Troubleshooting

- ⚙️ **CUDA errors:** Ensure you have GPU-compatible PyTorch installed.  
- 🔑 **Hugging Face Token:** Add your token to the `.ipynb` file or environment variable before running Stable Diffusion.  
- 🌐 **Frontend connection issue:** Verify both backend (`:8000`) and frontend (`:5173`) are running simultaneously.  

---

## 📚 Future Improvements

- [ ] Integrate continual learning for adaptive feature extraction.  
- [ ] Introduce user-based preference weighting in search results.  
- [ ] Extend support for custom image galleries and tagging.  
- [ ] Explore advanced vector databases like **Pinecone** or **Milvus**.  
- [ ] Fine-tune Stable Diffusion for domain-specific use cases.  

---

## 🧑‍💻 Author

**Developed by:** Saraswan Chakrabortty  

---

## 🪄 License

This project is licensed under the **MIT License** — free to use, modify, and distribute.

---

### 🌟 Star the Repo if You Like It!

> “Search smarter. Generate faster. Learn continuously.”  
> — *Optic Core Engine*
