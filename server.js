const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const fs = require("fs");
const exphbs = require("express-handlebars");
const sessions = require("client-sessions");

const app = express();
const PORT = process.env.PORT || 3000;

// connect to MongoDB
mongoose.connect("mongodb+srv://suthayachandran:sush123@cluster0.06cl7ud.mongodb.net/galleryDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// schema
const imageSchema = new mongoose.Schema({
  filename: String,
  description: String,
  price: Number,
  status: String
});

const Image = mongoose.model("Image", imageSchema);

// middleware
app.use(express.urlencoded({ extended: true }));

// sessions
app.use(
  sessions({
    cookieName: "session",
    secret: "gallerySecretKey",
    duration: 30 * 60 * 1000
  })
);

// handlebars
app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

// static files
app.use(express.static(path.join(__dirname, "public")));

// users
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, "user.json"))
);


// login page
app.get("/", (req, res) => {
  res.render("login", { error: "" });
});

// login POST
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!users[username]) {
    return res.render("login", { error: "Not a registered username" });
  }

  if (users[username] !== password) {
    return res.render("login", { error: "Invalid password" });
  }

  // reset all images to available on login
  await Image.updateMany({}, { status: "A" });

  req.session.user = username;
  res.redirect("/gallery");
});

// gallery page
app.get("/gallery", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  // only show available images
  const images = await Image.find({ status: "A" });

  res.render("gallery", {
    username: req.session.user,
    images: images
  });
});

// order page
app.get("/order", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  const filename = req.query.filename;

  const image = await Image.findOne({ filename: filename });

  res.render("order", { image });
});

// BUY
app.post("/buy", async (req, res) => {
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
app.post("/cancel", (req, res) => {
  const filename = req.body.filename;

  res.send(`
    <script>
      alert("MAYBE NEXT TIME");
      window.location.href = "/order?filename=${filename}";
    </script>
  `);
});

// logout
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

// start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});