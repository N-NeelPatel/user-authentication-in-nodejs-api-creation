import express from "express";
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
} from "../controllers/notes.js";
import jwt from "jsonwebtoken";

const router = express.Router();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      // forbidden
      return res.sendStatus(403);
    }
    console.log("Authentication middleware", user);
    req.user = user;
    next();
  });
}

router.get("/", authenticateToken, getNotes);

router.get("/:id", authenticateToken, getNote);

router.post("/", authenticateToken, createNote);

router.put("/:id", authenticateToken, updateNote);

router.patch("/:id", authenticateToken, updateNote);

router.delete("/:id", deleteNote);

export default router;
