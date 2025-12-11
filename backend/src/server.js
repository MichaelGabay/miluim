import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import businessesRoutes from "./routes/businesses.js"
import adminRoutes from "./routes/admin.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: "*" }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
connectDB()

// Routes
app.use("/api/businesses", businessesRoutes)
app.use("/api/admin", adminRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
