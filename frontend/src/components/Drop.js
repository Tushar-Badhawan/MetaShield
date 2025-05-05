import React, { useEffect, useRef, useState } from "react";
import "../styles/Drop.css";

const Drop = ({ scrollIntoView }) => {
  const dropRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    if (scrollIntoView && dropRef.current) {
      dropRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollIntoView]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadStatus("");
    setUploadProgress(0);
    setMetadata(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsUploading(true);
      setUploadStatus("Uploading...");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:8000/upload_image/", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = async () => {
        setIsUploading(false);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setUploadStatus("✅ Upload successful!");

          const metadataRes = await fetch(
            `http://localhost:8000/image_metadata/${data.filename}`
          );
          const exifData = await metadataRes.json();

          if (exifData && Object.keys(exifData).length > 0) {
            setMetadata(exifData);
          } else {
            setMetadata({ message: "No EXIF data found." });
          }

          setTimeout(() => {
            dropRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 300);
        } else {
          setUploadStatus("❌ Upload failed.");
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setUploadStatus("❌ Upload failed.");
      };

      xhr.send(formData);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("❌ Upload failed.");
      setIsUploading(false);
    }
  };

  const renderMetadata = (data) => {
    return (
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong>{" "}
            {typeof value === "object" && value !== null ? (
              <ul>
                {Object.entries(value).map(([subKey, subVal]) => (
                  <li key={subKey}>
                    <strong>{subKey}:</strong>{" "}
                    {typeof subVal === "object" ? JSON.stringify(subVal) : subVal.toString()}
                  </li>
                ))}
              </ul>
            ) : (
              value.toString()
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="drag-drop-section" ref={dropRef}>
      <h2 className="upload-heading">Upload Image to MetaShield</h2>
      <div className="drag-drop-space">
        <label htmlFor="file-upload" className="custom-file-upload">
          Choose File
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {selectedFile && <p className="filename">Selected: {selectedFile.name}</p>}
        <button className="upload-button" onClick={handleUpload}>
          Upload
        </button>

        {isUploading && (
          <div className="upload-progress">
            <div className="spinner"></div>
            <span>{uploadProgress}%</span>
          </div>
        )}

        {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
      </div>

      {metadata && (
        <div className="metadata-display">
          <h3>EXIF Metadata</h3>
          {metadata.message || metadata.error ? (
            <p>{metadata.message || metadata.error}</p>
          ) : (
            renderMetadata(metadata)
          )}
        </div>
      )}
    </section>
  );
};

export default Drop;
