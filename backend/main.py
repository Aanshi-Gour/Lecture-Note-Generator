from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from note_generator import generate_notes
from quiz_generator import generate_quiz
from transcription import transcribe_audio

import os
import uvicorn

# PDF generation imports
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
import markdown2



# Initialize FastAPI app

app = FastAPI(title="Auto-Note Generator Agent", version="1.0")

# Enable CORS for frontend (React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] ## Which origins (frontend URLs) can access/call the API (* means all)
    allow_credentials=True, # Whether cookies/authorization headers are allowed
    allow_methods=["*"],    # HTTP methods allowed (GET, POST, PUT, etc.)
    allow_headers=["*"],    # Headers allowed in the request
)


# Root route (health check)

@app.get("/")
async def root():
    return {"message": "Auto-Note Generator Backend running successfully!"}



# Upload and transcribe route

@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """
    Upload an audio/video file, transcribe it using Whisper,
    and generate lecture notes using Gemini.
    """
    try:
        file_path = f"temp_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())

        print("Transcribing audio...")
        transcript = transcribe_audio(file_path)
        print("Transcription complete!")

        print("Generating notes using Gemini...")
        notes = generate_notes(transcript)
        print("Notes generated successfully!")

        os.remove(file_path)

        return {"transcript": transcript, "notes": notes}

    except Exception as e:
        print("Error during processing:", e)
        raise HTTPException(status_code=500, detail=str(e))



# Generate quiz route

@app.post("/generate_quiz")
async def create_quiz(data: dict):
    """
    Takes lecture notes and generates a quiz using Gemini.
    """
    try:
        notes_text = data.get("notes", "")
        if not notes_text:
            raise HTTPException(status_code=400, detail="No notes provided for quiz generation.")

        print("Generating quiz from notes...")
        quiz = generate_quiz(notes_text)
        print("Quiz generated successfully!")

        return {"quiz": quiz}

    except Exception as e:
        print("Quiz generation error:", e)
        raise HTTPException(status_code=500, detail=str(e))



# Download Notes as PDF 

@app.post("/download_pdf")
async def download_pdf(data: dict):
    try:
        notes_text = data.get("notes", "")
        if not notes_text:
            raise HTTPException(status_code=400, detail="No notes provided for PDF export.")

        pdf_path = "notes_output.pdf"

        # Convert Markdown → HTML
        html_content = markdown2.markdown(notes_text)

        # Prepare PDF
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        styles = getSampleStyleSheet()
        style = styles["Normal"]
        style.fontSize = 11
        style.leading = 15 # sets the space between lines of text.

        story = []

        # Add each block (paragraph)
        for block in html_content.split("\n"):
            block = block.strip()
            if not block:
                story.append(Spacer(1, 10))
                continue

            story.append(Paragraph(block, style))
            story.append(Spacer(1, 8))

        # Build PDF
        doc.build(story)

        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename="Notes.pdf"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Run Server

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
