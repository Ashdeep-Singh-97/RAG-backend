import express from "express";
import routes from "./routes/route.js";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();
const PORT = 5001;
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json());
app.use("/api", routes);
app.get("/test", (req, res) => {
    res.status(200).send("Test OK !");
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
process.stdin.resume();
//# sourceMappingURL=index.js.map