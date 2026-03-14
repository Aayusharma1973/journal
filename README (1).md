# ArvyaX Journal

A journaling app built for the ArvyaX assignment. Users can log how they felt during nature sessions and get emotion analysis powered by Llama 3 8B.

Live demo: https://journal-two-kappa.vercel.app  
Backend: https://arvyax-backend-4zky.onrender.com

---

## What it does

- Users write a journal entry after a nature session (forest, ocean, mountain etc)
- The entry gets saved to MongoDB
- They can click Analyze and the app sends the text to Llama 3 8B via Groq
- The model returns the emotion, 3-5 keywords and a one line summary
- The insights section shows patterns over time — most common emotion, favourite ambience, recent keywords
- Same entry won't get analyzed twice — result is cached in the database

---

## Stack

- **Backend** — Node.js with Express
- **Database** — MongoDB Atlas
- **AI** — Llama 3 8B via Groq (free tier)
- **Frontend** — React
- **Deployed on** — Render (backend) + Vercel (frontend)

---

## Running locally

You'll need Node 18+, a MongoDB Atlas account and a Groq API key. Groq is free at console.groq.com.

```bash
git clone https://github.com/Aayusharma1973/journal.git
cd journal
```

Backend:
```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_key
```

```bash
node app.js
```

Frontend:
```bash
cd frontend
npm install
npm start
```

Opens at localhost:3000. Backend runs on localhost:5000.

---

## API endpoints

| Method | Route | What it does |
|---|---|---|
| POST | `/api/journal` | Save a new entry |
| GET | `/api/journal/:userId` | Get all entries for a user |
| POST | `/api/journal/analyze` | Run emotion analysis |
| GET | `/api/journal/insights/:userId` | Get user insights |

Quick test:
```bash
# save an entry
curl -X POST http://localhost:5000/api/journal \
  -H "Content-Type: application/json" \
  -d '{"userId":"aayush","ambience":"forest","text":"felt really calm today"}'

# analyze it — use the _id from the response above
curl -X POST http://localhost:5000/api/journal/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"felt really calm today","entryId":"PASTE_ID_HERE"}'

# insights
curl http://localhost:5000/api/journal/insights/aayush
```

---

## Project structure

```
journal/
├── backend/
│   ├── src/
│   │   ├── controllers/journalController.js
│   │   ├── models/JournalEntry.js
│   │   ├── routes/journal.js
│   │   ├── services/llmService.js
│   │   └── middleware/rateLimiter.js
│   └── app.js
└── frontend/
    └── src/
        ├── components/
        │   ├── Header.jsx
        │   ├── EntryForm.jsx
        │   ├── EntryList.jsx
        │   ├── InsightsPanel.jsx
        │   └── AnalyzeModal.jsx
        ├── App.jsx
        ├── api.js
        └── index.css
```

---

## A few things worth noting

Rate limiting is set to 100 requests per 15 minutes across all routes and 10 per minute specifically on the analyze endpoint since that hits an external API.

The free Render instance sleeps after 15 minutes of inactivity so the first request might be slow. That's just how free hosting works.

The `.env` file is gitignored. Don't commit your keys.
