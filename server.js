const express = require("express");
const path = require("path");
const fs = require("fs");
const exphbs = require("express-handlebars");
const sessions = require("client-sessions");
const LineByLineReader = require("line-by-line");

const app = express();
const PORT = process.env.PORT || 3000;

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
const users = JSON.parse(fs.readFileSync(path.join(__dirname, "user.json")));

// function to read images from imageList.txt
function getImages(callback) {

  const filePath = path.join(__dirname, "imageList.txt");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.log("Error reading file:", err);
      return callback([]);
    }

    const images = data.split("\n").map(line => line.trim()).filter(line => line !== "");

    callback(images);
  });

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
app.get("/gallery", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  getImages((images) => {
    res.render("gallery", {
      username: req.session.user,
      images: images,
      selectedImage: images[0]
    });
  });
});

// handle image selection
app.post("/gallery", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  const chosen = req.body.image;

  getImages((images) => {
    let imageToShow = chosen;

    if (!imageToShow) {
      imageToShow = images[0];
    }

    res.render("gallery", {
      username: req.session.user,
      images: images,
      selectedImage: imageToShow
    });
  });
});

// logout
app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

// start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});