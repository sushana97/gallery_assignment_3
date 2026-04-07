const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

let Image;

try {
  Image = mongoose.model("Image");
} catch {
  const imageSchema = new mongoose.Schema({
    filename: String,
    description: String,
    price: Number,
    status: String
  });

  Image = mongoose.model("Image", imageSchema);
}

// GET order page 
router.get("/order", async (req, res) => {
  const filename = req.query.filename;

  if (!filename) {
    return res.send("No filename provided");
  }

  const image = await Image.findOne({ filename: filename }).lean();

  if (!image) {
    return res.send("Image not found");
  }

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