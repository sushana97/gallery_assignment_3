const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Image = mongoose.model("Image");

// GET order page
router.get("/order", async (req, res) => {
  const filename = req.query.filename;

  if (!filename) {
    return res.send("No filename provided");
  }

  const image = await Image.findOne({ filename }).lean();

  if (!image) {
    return res.send("Image not found");
  }

  res.render("order", { image });
});

module.exports = router;