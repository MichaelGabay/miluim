import express from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()

// POST login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      })
      res.json({ token })
    } else {
      res.status(401).json({ error: "Invalid credentials" })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET verify token
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" })
      }
      res.json({ valid: true, user: decoded })
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
