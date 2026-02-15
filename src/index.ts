import express from "express";
import routes from "./routes/route.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 5001;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean) as string[];

// CORS options
const corsOptions = {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

app.use(express.json());

app.use("/api",routes);

app.get("/test", (req, res) => {
    res.status(200).json({
    backend: process.env.NEXT_PUBLIC_BACKEND_URL,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

process.stdin.resume();
