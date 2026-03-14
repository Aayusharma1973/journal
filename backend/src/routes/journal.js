const express = require("express");
const router = express.Router();
const {
  createEntry,
  getEntries,
  analyzeEntry,
  getInsights,
} = require("../controllers/journalController");
const { generalLimiter, analyzeLimiter } = require("../middleware/rateLimiter");

router.use(generalLimiter);

router.post("/analyze", analyzeLimiter, analyzeEntry);
router.get("/insights/:userId", getInsights);
router.post("/", createEntry);
router.get("/:userId", getEntries);

module.exports = router;