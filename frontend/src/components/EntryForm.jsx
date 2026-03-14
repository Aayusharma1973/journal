import { useState } from "react";
import { createEntry } from "../api";

const AMBIENCES = [
  { value: "forest",   label: "🌲 Forest"   },
  { value: "ocean",    label: "🌊 Ocean"    },
  { value: "mountain", label: "🏔️ Mountain" },
  { value: "meadow",   label: "🌸 Meadow"   },
  { value: "desert",   label: "🏜️ Desert"   },
  { value: "rain",     label: "🌧️ Rain"     },
];

export default function EntryForm({ userId, onSaved }) {
  const [ambience, setAmbience] = useState("forest");
  const [text, setText]         = useState("");
  const [status, setStatus]     = useState({ msg: "", type: "" });

  async function handleSubmit() {
    if (!userId.trim()) {
      setStatus({ msg: "enter your name first", type: "error" });
      return;
    }
    if (!text.trim()) {
      setStatus({ msg: "write something first", type: "error" });
      return;
    }

    setStatus({ msg: "saving...", type: "muted" });

    try {
      const data = await createEntry(userId, ambience, text);
      if (!data.success) throw new Error(data.error);

      setStatus({ msg: "saved ✦", type: "success" });
      setText("");
      onSaved();
      setTimeout(() => setStatus({ msg: "", type: "" }), 3000);
    } catch (err) {
      setStatus({ msg: err.message, type: "error" });
    }
  }

  const statusColor = {
    error:   "#d97b7b",
    success: "var(--sage)",
    muted:   "var(--text-3)",
  }[status.type] || "transparent";

  return (
    <section className="card card-entry">
      <div className="form-row">
        <div className="form-group">
          <label>Ambience</label>
          <div className="ambience-pills">
            {AMBIENCES.map((a) => (
              <button
                key={a.value}
                className={`pill ${ambience === a.value ? "active" : ""}`}
                onClick={() => setAmbience(a.value)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Your thoughts</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I felt... today the nature session made me..."
        />
      </div>

      <div className="form-footer">
        <span style={{ fontSize: 13, color: statusColor }}>{status.msg}</span>
        <button className="btn-save" onClick={handleSubmit}>
          Save Entry →
        </button>
      </div>
    </section>
  );
}