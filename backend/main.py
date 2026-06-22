from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io

from inference import generator

app = FastAPI(title="AbdoGround", version="1.0")

# allow the React dev server (Vite defaults to port 5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"status": "ok", "service": "AbdoGround report generator"}


@app.post("/generate")
async def generate(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")
    try:
        data = await file.read()
        pil_img = Image.open(io.BytesIO(data))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the image.")

    result = generator.generate_report(pil_img)
    return result      # {"report": "...", "heatmap": "<base64 png>"}