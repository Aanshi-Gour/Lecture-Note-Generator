from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import google.generativeai as genai
import re

GOOGLE_API_KEY = "AIzaSyBZugrVgRwSRrk8u8P5d56dEDm3VWk5KvE"

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GOOGLE_API_KEY
)


template = """
You are a professional MCQ generator that strictly follows instructions.

You are given lecture notes. Based only on the information inside those notes, create 5 factual multiple-choice questions (MCQs).

Each question must have:
- Exactly 4 distinct and realistic options labeled A, B, C, D.
- Only one option that is factually correct.
- The correct option should be randomized (not always A).
- The last line for each question must strictly follow this format: Answer: X
  where X is ONLY the correct option letter (A–D).

Do NOT include explanations, reasoning, or commentary.
Avoid emojis or symbols.

Example format (follow exactly):
1. What is the main component of a CPU?
A) Control Unit
B) ALU
C) Memory Unit
D) Input Device
Answer: B

Now generate the quiz strictly based on these notes:
{notes}
"""


prompt = PromptTemplate.from_template(template)



# CLEANING FUNCTION

def clean_quiz_output(text: str) -> str:
    """
    Fix Gemini's messy output so React can parse correctly.
    Ensures:
      - Answer: X (ONLY a single letter)
      - Removes explanations
      - Normalizes option formatting
    """

    lines = text.split("\n")
    cleaned_lines = []

    for line in lines:
        original = line.strip()

        
        if re.match(r"^(sure|here|okay|alright|generating|based on|mcq)", original.lower()):
            continue

        # Normalize option formatting: A. → A) 
        opt_match = re.match(r"^([A-Da-d])[).:\-]\s*(.*)", original)
        if opt_match:
            label = opt_match.group(1).upper()
            rest = opt_match.group(2).strip()
            cleaned_lines.append(f"{label}) {rest}")
            continue

        # Normalize Answer line: keep ONLY the letter
        if original.lower().startswith("answer"):
            m = re.search(r"\b([A-Da-d])\b", original)
            if m:
                cleaned_lines.append(f"Answer: {m.group(1).upper()}")
            continue

        # Leave question lines unchanged
        cleaned_lines.append(original)

    # Remove empty lines
    cleaned_lines = [l for l in cleaned_lines if l.strip()]

    # Ensure spacing between question
    final = []
    for line in cleaned_lines:
        final.append(line)
        if line.startswith("Answer:"):
            final.append("")

    return "\n".join(final).strip()


# -------------------------
# QUIZ GENERATOR
# -------------------------
def generate_quiz(notes: str) -> str:
    """
    Generate a clean, properly formatted quiz with randomized correct answers.
    """
    if not notes or notes.strip() == "":
        return "No notes provided."

    formatted_prompt = prompt.format(notes=notes)
    print("Sending to Gemini...\n")

    response = llm.invoke(formatted_prompt)
    quiz_text = response.content.strip() if hasattr(response, "content") else str(response)

    print("Gemini Response Received\n")

    # FINAL CLEANING (most important fix)
    quiz_text = clean_quiz_output(quiz_text)

    return quiz_text
