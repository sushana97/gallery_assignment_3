const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  filename: String,
  description: String,
  price: Number,
  status: String
});

const Image = mongoose.model("Image");

// GET order page 
router.get("/order", async (req, res) => {
  const filename = req.query.filename;

  const image = await Image.findOne({ filename: filename }).lean();

  res.render("order", { image });
});

// BUY
router.post("/buy", async (req, res) => {
  const filename = req.body.filename;

  await Image.updateOne(
    { filename: filename },
    { status: "S" }
  );

  res.send(`
    <script>
      alert("SOLD");
      window.location.href = "/gallery";
    </script>
  `);
});

// CANCEL 
router.post("/cancel", (req, res) => {
  const filename = req.body.filename;

  res.send(`
    <script>
      alert("MAYBE NEXT TIME");
      window.location.href = "/order?filename=${filename}";
    </script>
  `);
});

module.exports = router;