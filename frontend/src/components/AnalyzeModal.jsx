import { useState, useEffect } from "react";
import { analyzeEntry } from "../api";

export default function AnalyzeModal({ entryId, text, onClose, onDone }) {
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");

  useEffect(() => {
    async function run() {
      try {
        const data = await analyzeEntry(text, entryId);
        if (!data.success) throw new Error(data.error);
        setResult(data);
        onDone();
      } catch (err) {
        setError(err.message);
      }
    }
    run();
  }, []);

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="modal open">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-icon">✦</div>
        <h3>Emotion Analysis</h3>

        {!result && !error && (
          <p className="loading-text">analyzing with Llama 3... ✦</p>
        )}

        {error && (
          <p style={{ color: "#d97b7b", fontSize: 14 }}>Error: {error}</p>
        )}

        {result && (
          <>
            <div className="modal-row">
              <div className="modal-row-label">
                Emotion {result.cached && <span className="cached-badge">from cache</span>}
              </div>
              <div className="modal-emotion">{result.emotion}</div>
            </div>
            <div className="modal-row">
              <div className="modal-row-label">Summary</div>
              <div className="modal-row-value">{result.summary}</div>
            </div>
            <div className="modal-row">
              <div className="modal-row-label">Keywords</div>
              <div className="modal-row-value">
                {result.keywords.map((k) => (
                  <span key={k} className="tag">{k}</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}