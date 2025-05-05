from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from services.metadata_service import extract_exif_data

app = FastAPI()

# CORS configuration to allow requests from Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://meta-shield.vercel.app"],  # Update with your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/upload_image/")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        print(f"Uploaded: {file.filename}")

        # Extract EXIF metadata
        metadata = extract_exif_data(file_path)

        # Return success response with filename and metadata
        return JSONResponse(content={"success": True, "filename": file.filename, "metadata": metadata})

    except Exception as e:
        print(f"Upload failed: {e}")
        # Return error response if upload fails
        return JSONResponse(
            content={"success": False, "error": str(e)},
            status_code=500
        )

@app.get("/image_metadata/{filename}")
async def image_metadata(filename: str):
    # Path to the uploaded image
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    # Check if file exists
    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found"}, status_code=404)

    # Extract EXIF metadata from the image
    metadata = extract_exif_data(file_path)

    # Return the extracted metadata
    return JSONResponse(content=metadata)
