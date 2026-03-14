# ARCHITECTURE.md

## How the system is structured

The app is split into three parts — a React frontend on Vercel, a Node/Express backend on Render, and MongoDB Atlas as the database. The LLM calls go from the backend to Groq's API which runs Llama 3 8B.

```
Browser → Vercel (React) → Render (Express) → MongoDB Atlas
                                    ↓
                               Groq API (Llama 3 8B)
```

When a user saves an entry it goes straight to MongoDB. Analysis only happens when they explicitly click the Analyze button — not automatically on save. This keeps LLM costs low and gives users control.

---

## The analyze flow

```
POST /api/journal/analyze
        ↓
Is analyzed = true in DB?
   YES → return cached result, skip LLM
   NO  → call Groq → save result to DB → return
```

The `analyzed` field in MongoDB acts as the cache flag. Once an entry has been analyzed the emotion, keywords and summary are stored directly on the document. Next time someone hits analyze on the same entry it just reads from the database instead of calling Groq again.

---

## Database schema

Each journal entry is stored as a single MongoDB document:

```js
{
  userId:    String,   // who wrote it
  ambience:  String,   // forest, ocean, mountain etc — no enum, dynamic
  text:      String,   // the actual journal content
  emotion:   String,   // filled after LLM analysis
  keywords:  [String], // array — native in MongoDB, no JSON parsing needed
  summary:   String,   // one line from the LLM
  analyzed:  Boolean,  // false by default, true after first analysis
  createdAt: Date,
  updatedAt: Date
}
```

Keywords being a native array is one of the reasons I picked MongoDB over SQLite for this — in SQLite you'd have to store it as a JSON string and parse it every time.

---

## Scaling to 100k users

The main bottleneck at that scale would be the database and the LLM calls.

For the database I'd move to a proper MongoDB Atlas M10 cluster with replica sets instead of the free tier. The `userId` field already has an index on it so user-specific queries are fast. I'd also add pagination to the entries endpoint — right now it returns everything which is fine for small datasets but not at scale.

For the API layer the Express app is stateless so horizontal scaling is straightforward — just spin up more instances behind a load balancer. PM2 cluster mode handles this well for a simpler setup, Kubernetes if it needs to be more robust.

The frontend is already on a CDN via Vercel so that part scales automatically.

---

## Reducing LLM cost

The caching layer already handles the most obvious case — same entry never gets analyzed twice. Beyond that:

The next thing I'd do is add a text hash check. If two different users write nearly identical entries there's no reason to call the LLM twice. Hash the text with sha256, store it alongside the analysis, check before calling the API.

For serious scale I'd move to a self-hosted Llama 3 8B using vLLM on a GPU instance. The per-token cost disappears and you just pay for compute. At high enough volume that's significantly cheaper than API pricing.

I'd also move analysis off the request path entirely. Instead of analyzing on demand, entries would go into a queue (BullMQ + Redis) and get processed in batches. Users would see a "processing" state and get notified when it's ready. This also makes it easier to retry failed calls without affecting the user experience.

---

## Caching strategy

Right now it's simple — `analyzed` boolean in MongoDB. Works well for the current scale.

If I needed more than that I'd add Redis in front:

```
Request comes in
    ↓
Check Redis — key is sha256(text), TTL 7 days
    hit → return immediately
    miss → check MongoDB
              hit → store in Redis, return
              miss → call Groq, store in both, return
```

Redis as L1 for sub-millisecond repeated lookups, MongoDB as L2 for persistence across server restarts. The sha256 key means even if the same text appears in a different entry or from a different user the analysis gets reused.

---

## Protecting journal data

Journal entries are personal so this needs to be taken seriously.

The most important thing would be encrypting the `text` field before storing it in MongoDB. AES-256 with the key stored in something like AWS Secrets Manager — not hardcoded, not in environment variables if avoidable.

For access control I'd add JWT auth. Right now any userId can read any other userId's entries if you know the ID. That needs to be locked down so the JWT's subject must match the userId in the request. This is a gap in the current implementation that would need to be fixed before this goes to real users.

On the LLM side — journal text currently leaves the infrastructure when it goes to Groq. For anything sensitive that's not ideal. Self-hosting the model solves this since the text never goes outside your own servers.

The other thing I'd add is a proper deletion endpoint. Users should be able to delete their data, both for trust and for compliance with GDPR if there are European users.
