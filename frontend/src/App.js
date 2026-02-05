import React, { useState } from "react";
import "./App.css";
import NotesDisplay from "./components/NotesDisplay";

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  // Send file to FastAPI backend
  const handleUpload = async () => {
    if (!file) {
      alert("Please select an audio or video file first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed. Check backend logs.");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setNotes(data.notes || "No notes generated. Please try again.");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setNotes("");
    setError("");
  };

  return (
    <div className="container">
      <h1>Auto Note Generator</h1>

      {!notes ? (
        <div className="upload-section">
          <p>
            Upload your lecture <strong>audio/video</strong> and generate smart,
            structured notes automatically!
          </p>
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileChange}
          />
          <button onClick={handleUpload} disabled={loading}>
            {loading ? "Processing..." : "Upload & Generate Notes"}
          </button>

          {loading && (
            <p style={{ color: "#007bff", marginTop: "10px" }}>
              Transcribing and generating notes...
            </p>
          )}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      ) : (
        <>
          <NotesDisplay notes={notes} />
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={handleReset}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Generate Again
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
