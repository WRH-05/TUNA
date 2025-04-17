import express from "express"
import next from "next"
import { Low } from "lowdb"
import { JSONFile } from "lowdb/node"
import path from "path"
import { fileURLToPath } from "url"
import cors from "cors"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataPath = path.join(__dirname, "data", "captures.json")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
  const server = express()

  // Initialize lowdb
  const adapter = new JSONFile(dataPath)
  const db = new Low(adapter)
  await db.read()
  db.data ||= { captures: [] }
  await db.write()

  // Middleware
  server.use(cors())
  server.use(express.json({ limit: "50mb" }))
  server.use((req, res, next) => {
    req.db = db
    next()
  })

  // API routes
  server.post("/api/capture", async (req, res) => {
    try {
      const { url, timestamp, imageBlob, textContent } = req.body

      if (!url || !timestamp) {
        return res.status(400).json({ success: false, message: "Missing required fields" })
      }

      const capture = {
        id: Date.now().toString(),
        url,
        timestamp,
        imageBlob,
        textContent,
        capturedAt: new Date().toISOString(),
      }

      db.data.captures.push(capture)
      await db.write()

      res.json({ success: true, capture })
    } catch (error) {
      console.error("Capture error:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  })

  server.get("/api/captures", async (req, res) => {
    try {
      const { url } = req.query
      let captures = db.data.captures

      if (url) {
        captures = captures.filter((c) => c.url === url)
      }

      res.json({ success: true, captures })
    } catch (error) {
      console.error("List error:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  })

  server.delete("/api/captures/:id", async (req, res) => {
    try {
      const { id } = req.params

      db.data.captures = db.data.captures.filter((c) => c.id !== id)
      await db.write()

      res.json({ success: true })
    } catch (error) {
      console.error("Delete error:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  })

  // Let Next.js handle all other routes
  server.all("*", (req, res) => handle(req, res))

  // Start server
  server.listen(3000, () => {
    console.log("> Ready on http://localhost:3000")
  })
})
