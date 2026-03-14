require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const journalRoutes = require("./src/routes/journal");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected "))
  .catch((err) => {
    console.error("MongoDB connection failed ", err.message);
    process.exit(1);
  });

app.use("/api/journal", journalRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ArvyaX Journal API running 🌿" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong", details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});