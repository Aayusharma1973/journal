const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    ambience: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
    },
    emotion: {
      type: String,
      default: null,
    },
    keywords: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: null,
    },
    analyzed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JournalEntry", journalEntrySchema);