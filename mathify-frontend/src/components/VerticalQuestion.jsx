import React from "react";

export default function VerticalQuestion({ question }) {
  if (!question) return null;

  // Split by whitespace
  const parts = question.trim().split(/\s+/);

  // Expected format: "Number1 Operator Number2" (e.g. "12 + 5")
  if (parts.length === 3) {
    const [num1, op, num2] = parts;
    
    // Format operator symbol if needed (e.g., * to x)
    const opDisplay = op === "*" ? "×" : op === "/" ? "÷" : op;

    return (
      <div className="vertical-question">
        <div className="num-row">{num1}</div>
        <div className="num-row op-row">
          <span className="op-symbol">{opDisplay}</span>
          <span className="num2">{num2}</span>
        </div>
        <div className="math-line" />
      </div>
    );
  }

  // Fallback for non-standard questions
  return <span className="question-text">{question}</span>;
}
