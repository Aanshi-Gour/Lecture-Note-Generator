import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../App.css";
import { FaEdit, FaSave, FaFilePdf, FaListAlt, FaBrain, FaStickyNote } from "react-icons/fa";

const NotesDisplay = ({ notes }) => {
  const [editable, setEditable] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes);
  const [quizData, setQuizData] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const handleEditToggle = () => setEditable(!editable);
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/download_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editedNotes }),
      });

      if (!response.ok) throw new Error("PDF download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "Notes.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("PDF error:", err);
      alert("Error downloading PDF.");
    }
  };

  
  // QUIZ PARSER
  
  const parseQuiz = (text) => {
    if (!text || typeof text !== "string") return [];

    const blocks = text
      .split(/\n(?=\d+\.)/)
      .map((b) => b.trim())
      .filter((b) => b !== "");

    const parsed = [];

    for (let block of blocks) {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      let question = lines[0].replace(/^\d+\.\s*/, "").trim();

      if (/(here (are|is)|multiple-?choice|ok(ay)?,?)/i.test(question)) {
        continue;
      }

      const options = lines
        .filter((l) => /^[A-Da-d][).:]\s*/.test(l))
        .map((optLine) => {
          const m = optLine.match(/^([A-Da-d])[).:]\s*(.*)$/);
          return {
            label: m ? m[1].toUpperCase() : optLine.charAt(0).toUpperCase(),
            text: m ? m[2].trim() : optLine.slice(1).trim(),
          };
        });

      const answerLine = lines.find((l) => /^Answer/i.test(l));
      let answerLabel = null;

      if (answerLine) {
        const m = answerLine.match(/\b([A-Da-d])\b/);
        if (m) answerLabel = m[1].toUpperCase();
      }

      parsed.push({ question, options, answerLabel });
    }

    return parsed;
  };

  // Generate quiz via backend
  const handleQuizGenerate = async () => {
    try {
      setLoadingQuiz(true);
      const response = await fetch("http://127.0.0.1:8000/generate_quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editedNotes }),
      });

      if (!response.ok) throw new Error("Quiz generation failed");

      const data = await response.json();
      const parsed = parseQuiz(data.quiz || "");
      setQuizData(parsed);
      setShowAnswers(false);
      setSelectedAnswers({});
    } catch (err) {
      console.error("Quiz generation error:", err);
      alert("Error generating quiz. Check backend logs.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelect = (qIndex, optionLabel) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionLabel }));
  };

  const toggleShowAnswers = () => setShowAnswers((s) => !s);

  return (
    <div className="notes-display">
      <h2 className="title-heading">
        <FaStickyNote size={26} style={{ marginRight: "10px" }} />
        Generated Notes
      </h2>

      {!editable ? (
        <div className="markdown-preview highlight-text">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {editedNotes}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          className="editable-textarea"
          value={editedNotes}
          onChange={(e) => setEditedNotes(e.target.value)}
        />
      )}

      {/* BUTTONS */}
      <div className="btn-group">

        {/* Edit Notes */}
        <button className="edit-btn" onClick={handleEditToggle}>
          {editable ? (
            <>
              <FaSave className="btn-icon" /> Save Notes
            </>
          ) : (
            <>
              <FaEdit className="btn-icon" /> Edit Notes
            </>
          )}
        </button>

        {/* Generate Quiz */}
        <button className="quiz-btn" onClick={handleQuizGenerate} disabled={loadingQuiz}>
          <FaListAlt className="btn-icon" />
          {loadingQuiz ? "Generating..." : "Generate Quiz"}
        </button>

        {/* Download PDF */}
        <button className="download-btn" onClick={handleDownloadPDF}>
          <FaFilePdf className="btn-icon" /> Download PDF
        </button>
      </div>

      {/* QUIZ SECTION */}
      {quizData.length > 0 && (
        <div className="quiz-section">
          <h3 className="quiz-heading">
            <FaBrain size={24} style={{ marginRight: "10px" }} />
            Generated Quiz
          </h3>

          {quizData.map((q, i) => (
            <div key={i} className="quiz-card">
              <p className="question">{i + 1}. {q.question}</p>

              <div className="options">
                {q.options.map((opt) => {
                  const isSelected = selectedAnswers[i] === opt.label;
                  const isCorrect = showAnswers && q.answerLabel === opt.label;

                  return (
                    <button
                      key={opt.label}
                      className={`option-btn ${isCorrect ? "correct" : isSelected ? "selected" : ""}`}
                      onClick={() => handleSelect(i, opt.label)}
                      disabled={showAnswers}
                    >
                      <strong>{opt.label})</strong> {opt.text}
                    </button>
                  );
                })}
              </div>

              {showAnswers && (
                <div className="answer-row">
                  <small>Correct: {q.answerLabel}</small>
                </div>
              )}
            </div>
          ))}

          <div className="btn-group">
            <button onClick={toggleShowAnswers} className="show-answer-btn">
              {showAnswers ? "Hide Answers" : "Show Answers"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesDisplay;
