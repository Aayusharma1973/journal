# ARCHITECTURE.md — ArvyaX Journal System

## System Overview

```
User (Browser)
      │
      │  HTTPS
      ▼
Vercel (React Frontend)
      │
      │  REST API calls
      ▼
Render (Node.js + Express Backend)
      │               │
      │               ▼
      │        MongoDB Atlas
      │        (journal_entries collection)
      │
      ▼
Groq API
(Llama 3 8B Inference)
```

---

## Request Flow — End to End

```
User writes entry → POST /api/journal
                          │
                          ▼
                   Validate inputs
                          │
                          ▼
                   Save to MongoDB
                          │
                          ▼
                   Return saved entry (_id)

User clicks Analyze → POST /api/journal/analyze
                          │
                          ▼
                   Check: analyzed = true?
                     │              │
                    YES             NO
                     │              │
                     ▼              ▼
               Return cached   Call Groq API
               result ✅       (Llama 3 8B)
                                    │
                                    ▼
                             Parse JSON response
                                    │
                                    ▼
                             Save to MongoDB
                             (emotion, keywords,
                              summary, analyzed=true)
                                    │
                                    ▼
                             Return to frontend
```

---

## Data Model

### `journal_entries` collection (MongoDB)

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated unique ID |
| `userId` | String | User identifier, indexed |
| `ambience` | String | Nature environment type |
| `text` | String | Raw journal entry content |
| `emotion` | String | LLM output — primary emotion |
| `keywords` | [String] | Native array of keywords |
| `summary` | String | One-line LLM summary |
| `analyzed` | Boolean | Cache flag — has LLM run? |
| `createdAt` | Date | Auto timestamp |
| `updatedAt` | Date | Auto timestamp |

---

## Component Breakdown

### Backend

| File | Responsibility |
|---|---|
| `app.js` | Express setup, MongoDB connection, middleware registration |
| `routes/journal.js` | URL to controller mapping, route ordering |
| `controllers/journalController.js` | Business logic for all 4 endpoints |
| `services/llmService.js` | Groq API call, prompt building, JSON parsing |
| `models/JournalEntry.js` | Mongoose schema and model |
| `middleware/rateLimiter.js` | General + strict rate limiting |

### Frontend

| File | Responsibility |
|---|---|
| `App.jsx` | Global state, data loading, component composition |
| `api.js` | All fetch calls to backend in one place |
| `Header.jsx` | User ID input, load journal button |
| `EntryForm.jsx` | Ambience pills, textarea, save logic |
| `EntryList.jsx` | Renders all journal entries |
| `InsightsPanel.jsx` | Displays aggregated stats |
| `AnalyzeModal.jsx` | Modal popup for LLM analysis result |
| `index.css` | All pastel styles, animations, responsive |

---

## How Would You Scale This to 100,000 Users?

### Database
- Migrate to a dedicated **MongoDB Atlas M10+ cluster** with replica sets
- Add compound indexes: `{ userId: 1, createdAt: -1 }` for fast paginated queries
- Implement **pagination** on `GET /api/journal/:userId` — return 20 entries per page instead of all
- Enable **MongoDB Atlas Search** for full-text search across journal entries

### Backend
- Move from Render free tier to **AWS EC2** or **Railway Pro** with auto-scaling
- Run multiple Express instances behind a **load balancer** (NGINX / AWS ALB)
- The API is stateless — horizontal scaling is straightforward
- Use **PM2 cluster mode** to utilize all CPU cores on each server instance

### Infrastructure
- Add a **CDN** (Cloudflare) in front of both frontend and backend
- Use **Redis** as a caching layer between Express and MongoDB for frequently accessed insights
- Move static frontend assets to **S3 + CloudFront**

---

## How Would You Reduce LLM Cost?

1. **Cache first (already implemented)** — `analyzed` flag in MongoDB ensures each entry is only sent to Groq once ever

2. **Text hash deduplication** — Generate `sha256(text)` hash on save. If two entries have identical text, reuse existing analysis without calling the API

3. **Self-hosted model** — At scale, run **Llama 3 8B** locally using `vLLM` or `llama.cpp` on a GPU server. Inference cost becomes electricity vs per-token API fees

4. **Background queue** — Don't analyze on demand. Queue unanalyzed entries in **BullMQ** (Redis-backed) and process them in batches during off-peak hours at lower priority

5. **Shorter prompts** — Current prompt is ~120 tokens. Avoid adding few-shot examples unless accuracy requires them — every extra token costs money at scale

---

## How Would You Cache Repeated Analysis?

### Current Implementation (DB-level cache)
```
Request with entryId
        │
        ▼
findOne({ _id: entryId, analyzed: true })
        │
     Found → return { cached: true, emotion, keywords, summary }
        │
   Not found → call Groq → save → return { cached: false, ... }
```

### Extended Strategy (Redis L1 + MongoDB L2)
```
Request arrives
        │
        ▼
Check Redis: key = sha256(text), TTL = 7 days
        │
      Hit → return instantly (< 1ms)
        │
      Miss → Check MongoDB analyzed flag
               │
             Hit → store in Redis → return
               │
             Miss → call Groq API
                      │
                      ▼
                 Store in Redis + MongoDB
                      │
                      ▼
                 Return to client
```

This two-layer approach handles:
- **Same text, different entryId** → Redis catches it
- **Server restart** → MongoDB is persistent fallback
- **TTL expiry** → MongoDB re-populates Redis

---

## How Would You Protect Sensitive Journal Data?

Journal entries are deeply personal. Multi-layer protection:

### 1. Encryption at Rest
- Encrypt the `text` field using **AES-256-GCM** before saving to MongoDB
- Store encryption key in **AWS Secrets Manager** or **HashiCorp Vault**
- Never log decrypted journal text in application logs

### 2. Encryption in Transit
- Enforce **HTTPS/TLS** via Render + Vercel (already handled)
- Add **HSTS headers** to prevent protocol downgrade attacks

### 3. Authentication & Authorization
- Add **JWT-based auth** (`jsonwebtoken`)
- Every route verifies the JWT's `sub` matches the `userId` parameter
- Users can only read and write their own entries — enforced at controller level
- Short JWT expiry (15 min) + refresh tokens

### 4. LLM Data Privacy
- With Groq API, journal text is sent to an external server
- For **HIPAA / GDPR compliance**, switch to a self-hosted Llama instance
- Text never leaves your infrastructure

### 5. Rate Limiting (already implemented)
- 100 req/15min general limit
- 10 req/min on analyze endpoint
- Add **IP-based anomaly detection** — alert if one IP queries many different userIds

### 6. Data Minimization
- Only collect what's needed — no device info, no location
- Add a **data deletion endpoint**: `DELETE /api/journal/:userId` to comply with GDPR right to erasure
- Set MongoDB TTL index to auto-delete entries older than X years if user is inactive
