from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from services.metadata_service import extract_exif_data

app = FastAPI()

# Enable CORS so frontend can communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update for production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/upload_image/")
async def upload_image(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        # Save file to disk
        with open(file_path, "wb") as f:
            f.write(await file.read())

        print(f"Uploaded: {file.filename}")
        
        # Extract EXIF data
        metadata = extract_exif_data(file_path)
        
        # Return success along with the extracted metadata
        return JSONResponse(content={"success": True, "filename": file.filename, "metadata": metadata})

    except Exception as e:
        print(f"Upload failed: {e}")
        return JSONResponse(
            content={"success": False, "error": str(e)},
            status_code=500
        )

@app.get("/image_metadata/{filename}")
async def image_metadata(filename: str):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found"}, status_code=404)

    # Extract EXIF data from the image
    metadata = extract_exif_data(file_path)
    return JSONResponse(content=metadata)
