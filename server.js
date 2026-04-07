const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const fs = require("fs");
const exphbs = require("express-handlebars");
const sessions = require("client-sessions");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect("mongodb+srv://suthayachandran:sush123@cluster0.06cl7ud.mongodb.net/galleryDB")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// UPDATED schema
const imageSchema = new mongoose.Schema({
  filename: String,
  description: String,
  price: Number,
  status: String
});

const Image = mongoose.model("Image", imageSchema);

// middleware
app.use(express.urlencoded({ extended: true }));

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

app.use(express.static(path.join(__dirname, "public")));

// users
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, "user.json"))
);

// ROUTER IMPORT
const orderRoutes = require("./routes/order");
app.use("/", orderRoutes);

// login page
app.get("/", (req, res) => {
  res.render("login", { error: "" });
});

// login logic
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!users[username]) {
    return res.render("login", { error: "Not a registered username" });
  }

  if (users[username] !== password) {
    return res.render("login", { error: "Invalid password" });
  }

  // RESET all images to Available
  await Image.updateMany({}, { status: "A" });

  req.session.user = username;
  res.redirect("/gallery");
});

// gallery page
app.get("/gallery", async (req, res) => {
  if (!req.session.user) return res.redirect("/");

  const images = await Image.find({ status: "A" });

  res.render("gallery", {
    username: req.session.user,
    images: images
  });
});

// logout
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});