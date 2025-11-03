from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
import os
import uuid
import time

from model_utils import generate_image
from cbir.index import search_similar, build_index

app = FastAPI()

# CORS config so React frontend can talk to FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"] to be strict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== TEXT-TO-IMAGE GENERATION ==========
@app.post("/generate-image")
async def generate_image_api(prompt: str = Form(...)):
    try:
        output_path = f"./cbir/image_db/{uuid.uuid4()}.png"
        os.makedirs("./cbir/image_db/", exist_ok=True)

        start_time = time.time()
        generate_image(prompt, output_path)
        total_time = round(time.time() - start_time, 2)

        return JSONResponse(content={
            "image_url": output_path.replace("./", "/"),
            "time_taken": total_time
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ========== CBIR API ==========
@app.post("/cbir/search")
async def cbir_search(file: UploadFile = File(...)):
    try:
        temp_path = f"./cbir/tmp_{uuid.uuid4()}.jpg"
        with open(temp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        start_time = time.time()
        results = search_similar(temp_path)
        elapsed = round(time.time() - start_time, 2)

        os.remove(temp_path)
        return JSONResponse(content={
            "results": [r.replace("./", "/") for r in results],
            "time_taken": elapsed
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/cbir/build-index")
def cbir_build_index():
    try:
        build_index()
        return {"message": "CBIR index built successfully"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# ========== Static File Serving ==========
from fastapi.staticfiles import StaticFiles
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")
app.mount("/cbir/image_db", StaticFiles(directory="cbir/image_db"), name="image_db")