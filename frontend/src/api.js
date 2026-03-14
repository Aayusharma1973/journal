const API = "http://localhost:5000/api/journal";

export async function createEntry(userId, ambience, text) {
  const res = await fetch(`${API}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, ambience, text }),
  });
  return res.json();
}

export async function getEntries(userId) {
  const res = await fetch(`${API}/${userId}`);
  return res.json();
}

export async function analyzeEntry(text, entryId) {
  const res = await fetch(`${API}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, entryId }),
  });
  return res.json();
}

export async function getInsights(userId) {
  const res = await fetch(`${API}/insights/${userId}`);
  return res.json();
}