export default function EntryList({ entries, loading, onAnalyze }) {
  const ambienceEmoji = {
    forest: "🌲", ocean: "🌊", mountain: "🏔️",
    meadow: "🌸", desert: "🏜️", rain: "🌧️",
  };

  if (loading) {
    return (
      <section className="card">
        <h2 className="card-title">Past Sessions</h2>
        <p className="empty-state">loading...</p>
      </section>
    );
  }

  return (
    <section className="card card-entries">
      <h2 className="card-title">Past Sessions</h2>

      {entries.length === 0 ? (
        <p className="empty-state">no entries yet — write your first one ✦</p>
      ) : (
        entries.map((entry) => (
          <div key={entry._id} className="entry">
            <div className="entry-header">
              <div className="entry-left">
                <span className="ambience-tag">
                  {ambienceEmoji[entry.ambience] || "🌿"} {entry.ambience}
                </span>
              </div>
              <span className="entry-date">{formatDate(entry.createdAt)}</span>
            </div>

            <p className="entry-text">{entry.text}</p>

            {entry.analyzed ? (
              <div className="entry-analysis">
                <div className="emotion-badge">✦ {entry.emotion}</div>
                <p className="entry-summary">{entry.summary}</p>
                <div>
                  {entry.keywords.map((k) => (
                    <span key={k} className="tag">{k}</span>
                  ))}
                </div>
              </div>
            ) : (
              <button
                className="btn-analyze"
                onClick={() => onAnalyze(entry._id, entry.text)}
              >
                ✦ Analyze emotion
              </button>
            )}
          </div>
        ))
      )}
    </section>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}