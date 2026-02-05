from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate

GOOGLE_API_KEY = "AIzaSyBZugrVgRwSRrk8u8P5d56dEDm3VWk5KvE"

# Initialize LLM model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=GOOGLE_API_KEY
)

# Prompt for summarization
template = """
You are an intelligent classroom assistant.
Summarize the following lecture clearly and concisely.
Highlight key points, formulas, and definitions using Markdown formatting.

Lecture:
{lecture}
"""

prompt = PromptTemplate.from_template(template) 

def generate_notes(lecture: str) -> str:
    """
    Generate AI-powered lecture notes using Gemini model.
    """
    formatted_prompt = prompt.format(lecture=lecture)
    response = llm.invoke(formatted_prompt)
    return response.content
