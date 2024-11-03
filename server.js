import express from "express";
import mongoose from "mongoose";
import shortUrl from "./model/shortStore.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// MongoDB connection with error handling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB:", err));

// Configure CORS with dynamic origin
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ["https://url-client-three.vercel.app"];
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200, // Some browsers (e.g., IE11) require this status
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Hello There!");
});

// Endpoint for creating or retrieving a shortened URL
app.post("/short", async (req, res) => {
  try {
    const found = await shortUrl.findOne({ full: req.body.full });
    if (found) {
      return res.status(200).json([found]);
    } else {
      const createdShortUrl = await shortUrl.create({ full: req.body.full });
      return res.status(201).json([createdShortUrl]);
    }
  } catch (error) {
    console.error("Error in /short route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Redirect route for short URLs
app.get("/:shortUrl", async (req, res) => {
  try {
    const short = await shortUrl.findOne({ short: req.params.shortUrl });
    if (!short) {
      return res.status(404).json({ message: "URL not found" });
    }
    res.redirect(short.full);
  } catch (error) {
    console.error("Error in redirect route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start server
const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server started on port ${port}`));
