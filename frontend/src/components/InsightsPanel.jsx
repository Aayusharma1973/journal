export default function InsightsPanel({ insights }) {
  return (
    <section className="card card-insights">
      <h2 className="card-title">Your Patterns</h2>
      <div className="insights-row">
        <div className="insight-box">
          <span className="insight-value">{insights.totalEntries}</span>
          <span className="insight-label">Total Sessions</span>
        </div>
        <div className="insight-box">
          <span className="insight-value">{insights.topEmotion || "—"}</span>
          <span className="insight-label">Top Emotion</span>
        </div>
        <div className="insight-box">
          <span className="insight-value">{insights.mostUsedAmbience || "—"}</span>
          <span className="insight-label">Fav Ambience</span>
        </div>
        <div className="keywords-row">
          <span className="insight-label">Recent Keywords</span>
          <div>
            {insights.recentKeywords.length > 0
              ? insights.recentKeywords.map((k) => (
                  <span key={k} className="tag">{k}</span>
                ))
              : <span style={{ fontSize: 13, color: "var(--text-3)" }}>
                  analyze entries to see keywords
                </span>
            }
          </div>
        </div>
      </div>
    </section>
  );
}