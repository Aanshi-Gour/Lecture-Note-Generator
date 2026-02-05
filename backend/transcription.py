import whisper

def transcribe_audio(file_path: str) -> str:
    """
    Uses OpenAI Whisper to transcribe audio into text.
    """
    print("Loading Whisper model...")
    model = whisper.load_model("base")
    result = model.transcribe(file_path)
    return result["text"]
