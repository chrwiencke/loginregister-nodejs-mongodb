const express = require("express");
const path = require("path");
const app = express();
const LogInCollection = require("./mongo");
const port = process.env.PORT || 3004;
const bcrypt = require("bcrypt");

const saltRounds = 10;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const tempelatePath = path.join(__dirname, "../pages");
const publicPath = path.join(__dirname, "../public");
console.log(publicPath);

app.set("view engine", "hbs");
app.set("views", tempelatePath);
app.use(express.static(publicPath));

app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/", (req, res) => {
  res.render("login");
});

app.post("/signup", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const data = {
      name: req.body.name,
      password: hashedPassword,
    };

    const checking = await LogInCollection.findOne({ name: req.body.name });

    if (checking) {
      res.status(400).send("User already exists");
    } else {
      await LogInCollection.insertMany([data]);
      res.status(201).render("home", {
        naming: req.body.name,
      });
    }
  } catch (e) {
    res.status(500).send("Error creating user");
  }
});

app.post("/login", async (req, res) => {
  try {
    const check = await LogInCollection.findOne({ name: req.body.name });

    if (check) {
      const isValid = await bcrypt.compare(req.body.password, check.password);
      if (isValid) {
        res.status(201).render("home", { naming: `${req.body.name}` });
      } else {
        res.status(401).send("Incorrect password");
      }
    } else {
      res.status(401).send("User not found");
    }
  } catch (e) {
    res.status(500).send("Error logging in");
  }
});

app.listen(port, () => {
  console.log("port connected");
});
