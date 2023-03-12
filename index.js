import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import fs from "fs";
import data from "./users.json" assert { type: "json" };

import notesRoutes from "./routes/notes.js";
const app = express();
const PORT = 3000;
dotenv.config();
app.use(bodyParser.json());
app.use("/notes", notesRoutes);

function checkExistingUser(email) {
  return new Promise((resolve, reject) => {
    fs.readFile("users.json", (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      const users = JSON.parse(data);
      let existingUser = users.users.find((curUser) => curUser.email === email);
      resolve(existingUser);
    });
  });
}

function addUserToDB(userData) {
  return new Promise((resolve, reject) => {
    fs.readFile("users.json", (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      const users = JSON.parse(data);
      let existingUser = users.users.find(
        (curUser) => curUser.email === userData.email
      );
      if (existingUser) {
        console.log("user already exists");
        return;
      }
      users.users.push(userData);
      fs.writeFile("users.json", JSON.stringify(users), (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("User added to users.json");
      });
      resolve();
    });
  });
}

app.get("/", (req, res) => {
  res.send("HELLO, this is homepage!");
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if the user exits or not
    let user = await checkExistingUser(email);
    if (!user) {
      return res.status(404).json({ message: "Invalid email or password." });
    }

    // compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

    res.cookie("token", token, { httpOnly: true });
    res.json({ accessToken: token, message: "signed in successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "server error" });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let existingUser = await checkExistingUser(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create user

    const newUser = {
      id: uuidv4(),
      name: name,
      email: email,
      password: hashedPassword,
    };

    // todo: adding user to the local json file
    await addUserToDB(newUser);

    const token = jwt.sign(newUser, process.env.ACCESS_TOKEN_SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.json({ message: "Signed up successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/signout", (req, res) => {
  res.clearCookie("token");

  res.json({ message: "Signed out successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running on PORT: http://localhost:${PORT}`);
});
