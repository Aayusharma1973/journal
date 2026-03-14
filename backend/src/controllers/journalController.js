const JournalEntry = require("../models/JournalEntry");
const { analyzeEmotion } = require("../services/llmService");

// POST /api/journal
async function createEntry(req, res, next) {
  try {
    const { userId, ambience, text } = req.body;

    if (!userId || !ambience || !text) {
      return res
        .status(400)
        .json({ error: "userId, ambience, and text are required." });
    }

    const entry = await JournalEntry.create({ userId, ambience, text });

    res.status(201).json({ success: true, entry });
  } catch (err) {
    next(err);
  }
}

// GET /api/journal/:userId
async function getEntries(req, res, next) {
  try {
    const entries = await JournalEntry.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, entries });
  } catch (err) {
    next(err);
  }
}

// POST /api/journal/analyze
async function analyzeEntry(req, res, next) {
  try {
    const { text, entryId } = req.body;

    if (!text) {
      return res.status(400).json({ error: "text is required." });
    }

    if (entryId) {
      const cached = await JournalEntry.findOne({ _id: entryId, analyzed: true });

      if (cached) {
        return res.json({
          success: true,
          cached: true,
          emotion: cached.emotion,
          keywords: cached.keywords,
          summary: cached.summary,
        });
      }
    }

    const analysis = await analyzeEmotion(text);

    if (entryId) {
      await JournalEntry.findByIdAndUpdate(entryId, {
        emotion: analysis.emotion,
        keywords: analysis.keywords,
        summary: analysis.summary,
        analyzed: true,
      });
    }

    res.json({ success: true, cached: false, ...analysis });
  } catch (err) {
    next(err);
  }
}

// GET /api/journal/insights/:userId
async function getInsights(req, res, next) {
  try {
    const { userId } = req.params;

    const totalEntries = await JournalEntry.countDocuments({ userId });

    if (totalEntries === 0) {
      return res.json({
        success: true,
        totalEntries: 0,
        topEmotion: null,
        mostUsedAmbience: null,
        recentKeywords: [],
      });
    }

    const topEmotionResult = await JournalEntry.aggregate([
      { $match: { userId, analyzed: true } },
      { $group: { _id: "$emotion", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const topAmbienceResult = await JournalEntry.aggregate([
      { $match: { userId } },
      { $group: { _id: "$ambience", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    const recentEntries = await JournalEntry.find(
      { userId, analyzed: true },
      { keywords: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(5);

    const recentKeywords = [
      ...new Set(recentEntries.flatMap((e) => e.keywords)),
    ].slice(0, 8);

    res.json({
      success: true,
      totalEntries,
      topEmotion: topEmotionResult[0]?._id || null,
      mostUsedAmbience: topAmbienceResult[0]?._id || null,
      recentKeywords,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createEntry, getEntries, analyzeEntry, getInsights };