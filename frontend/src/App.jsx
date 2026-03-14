import { useState, useCallback } from "react";
import Header from "./components/Header";
import EntryForm from "./components/EntryForm";
import EntryList from "./components/EntryList";
import InsightsPanel from "./components/InsightsPanel";
import AnalyzeModal from "./components/AnalyzeModal";
import { getEntries, getInsights } from "./api";

export default function App() {
  const [userId, setUserId]       = useState("");
  const [entries, setEntries]     = useState([]);
  const [insights, setInsights]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  // modal state
  const [modal, setModal] = useState({ open: false, entryId: null, text: "" });

  const loadData = useCallback(async (uid) => {
    const id = uid || userId;
    if (!id.trim()) return;
    setLoading(true);
    try {
      const [entriesRes, insightsRes] = await Promise.all([
        getEntries(id),
        getInsights(id),
      ]);
      if (entriesRes.success)  setEntries(entriesRes.entries);
      if (insightsRes.success) setInsights(insightsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  function openModal(entryId, text) {
    setModal({ open: true, entryId, text });
  }

  function closeModal() {
    setModal({ open: false, entryId: null, text: "" });
  }

  function onAnalyzeDone() {
    loadData();
  }

  return (
    <>
      <Header
        userId={userId}
        setUserId={setUserId}
        onLoad={() => loadData()}
      />

      <section className="hero">
        <p className="hero-sub">how did nature make you feel today?</p>
        <h1 className="hero-title">Write your <em>session</em></h1>
      </section>

      <main className="main">
        <EntryForm
          userId={userId}
          onSaved={() => loadData()}
        />

        {/* View Insights Button */}
        {insights && insights.totalEntries > 0 && (
          <button
            className="btn-insights-toggle"
            onClick={() => setShowInsights((prev) => !prev)}
          >
            {showInsights ? "Hide Insights ↑" : "✦ View Insights →"}
          </button>
        )}

        {showInsights && insights && (
          <InsightsPanel insights={insights} />
        )}

        <EntryList
          entries={entries}
          loading={loading}
          onAnalyze={openModal}
        />
      </main>

      {modal.open && (
        <AnalyzeModal
          entryId={modal.entryId}
          text={modal.text}
          onClose={closeModal}
          onDone={onAnalyzeDone}
        />
      )}
    </>
  );
}