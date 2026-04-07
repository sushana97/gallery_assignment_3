const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const fs = require("fs");
const exphbs = require("express-handlebars");
const sessions = require("client-sessions");
const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect("mongodb+srv://suthayachandran:sush123@cluster0.06cl7ud.mongodb.net/?appName=Cluster0")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

const imageSchema = new mongoose.Schema({
  filename: String
});

const Image = mongoose.model("Image", imageSchema);

// middleware
app.use(express.urlencoded({ extended: true }));

// sessions setup
app.use(
  sessions({
    cookieName: "session",
    secret: "gallerySecretKey",
    duration: 30 * 60 * 1000
  })
);

// handlebars setup
app.engine(".hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", path.join(__dirname, "views"));

// static files
app.use(express.static(path.join(__dirname, "public")));

// read users
const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, "user.json"))
);

// function to get images from MongoDB
async function getImages() {
  return await Image.find();
}


// login page
app.get("/", (req, res) => {
  res.render("login", { error: "" });
});

// handle login
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!users[username]) {
    return res.render("login", { error: "Not a registered username" });
  }

  if (users[username] !== password) {
    return res.render("login", { error: "Invalid password" });
  }

  req.session.user = username;
  res.redirect("/gallery");
});

// gallery page
app.get("/gallery", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  const images = await getImages();

  res.render("gallery", {
    username: req.session.user,
    images: images.map(img => img.filename),
    selectedImage: images[0]?.filename
  });
});

// handle image selection
app.post("/gallery", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  const images = await getImages();

  let imageToShow = req.body.image;

  if (!imageToShow) {
    imageToShow = images[0]?.filename;
  }

  res.render("gallery", {
    username: req.session.user,
    images: images.map(img => img.filename),
    selectedImage: imageToShow
  });
});

// logout
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

// start server
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});