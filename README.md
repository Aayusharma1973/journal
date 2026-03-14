# 🌿 ArvyaX Journal — AI-Powered Nature Session Journal

A full-stack journaling app where users log their nature sessions and get AI-powered emotion analysis using **Llama 3 8B** via Groq.

---

## 🔗 Live Demo

| Service | URL |
|---|---|
| Frontend | https://journal-two-kappa.vercel.app |
| Backend API | https://arvyax-backend-4zky.onrender.com |

---

## ✨ Features

- 📝 Write and save journal entries after nature sessions
- 🌲 Choose from dynamic ambience types (Forest, Ocean, Mountain, Meadow, Desert, Rain)
- 🤖 AI emotion analysis using **Llama 3 8B** (via Groq API)
- 📊 Personal insights — top emotion, favourite ambience, recent keywords
- ⚡ Analysis caching — same entry is never analyzed twice
- 🔒 Rate limiting on all endpoints
- 📱 Fully responsive pastel minimal UI built in React

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, plain CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| AI Model | Llama 3 8B via Groq API |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
journal/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── journalController.js   # business logic for all endpoints
│   │   ├── models/
│   │   │   └── JournalEntry.js        # mongoose schema
│   │   ├── routes/
│   │   │   └── journal.js             # route definitions
│   │   ├── services/
│   │   │   └── llmService.js          # Groq / Llama 3 integration
│   │   └── middleware/
│   │       └── rateLimiter.js         # rate limiting
│   ├── app.js                         # express entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── EntryForm.jsx
    │   │   ├── EntryList.jsx
    │   │   ├── InsightsPanel.jsx
    │   │   └── AnalyzeModal.jsx
    │   ├── App.jsx
    │   ├── api.js                     # all API calls
    │   └── index.css                  # all styles
    └── public/
        └── index.html
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repo

```bash
git clone https://github.com/Aayusharma1973/journal.git
cd journal
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/arvyax_journal
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend:
```bash
node app.js
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start
```

Opens at `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/journal` | Create a new journal entry |
| `GET` | `/api/journal/:userId` | Get all entries for a user |
| `POST` | `/api/journal/analyze` | Analyze text emotion with Llama 3 |
| `GET` | `/api/journal/insights/:userId` | Get aggregated user insights |

### Example Requests

**Create entry:**
```bash
curl -X POST https://arvyax-backend-4zky.onrender.com/api/journal \
  -H "Content-Type: application/json" \
  -d '{"userId":"aayush","ambience":"forest","text":"I felt calm today after listening to the rain."}'
```

**Analyze:**
```bash
curl -X POST https://arvyax-backend-4zky.onrender.com/api/journal/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"I felt calm today after listening to the rain.","entryId":"YOUR_ENTRY_ID"}'
```

**Insights:**
```bash
curl https://arvyax-backend-4zky.onrender.com/api/journal/insights/aayush
```

---

## 🗄 Data Model

```json
{
  "_id": "ObjectId",
  "userId": "string",
  "ambience": "string",
  "text": "string",
  "emotion": "string | null",
  "keywords": ["string"],
  "summary": "string | null",
  "analyzed": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## ⚙️ Environment Variables

### Backend `.env`

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `GROQ_API_KEY` | Groq API key for Llama 3 access |

### Frontend `.env`

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |

---

## 📝 Notes

- Free Render instances spin down after 15 min of inactivity — first request may take ~50 seconds to wake up
- Analysis results are cached in MongoDB — same entry is never sent to LLM twice
- Rate limiting: 100 req/15min general, 10 req/min on analyze endpoint
