import AIController from "../controllers/controller.js";
import express from "express";
// import multer from "multer";
import path from "path";
import { rateLimit } from "express-rate-limit";
import fs from "fs";
const router = express.Router();
const Controller = new AIController();
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 3 * 1024 * 1024, // 10MB limit (optional)
//   },
// });
// const uploadLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Max 5 uploads per 15 minutes
//   message: {
//     error: "Arre bhai itne saare PDF mat upload karo! Thoda wait karo. 15 minute baad try karo ☕"
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// ✅ Rate limiter for website processing
const websiteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Max 10 requests per 15 minutes
    message: {
        error: "Website processing limit exceed ho gaya bhai! 15 minute baad try karo ☕"
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// ✅ Rate limiter for chat/query - more relaxed
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Max 30 chat messages per 15 minutes
    message: {
        error: "Arre bhai itni jaldi mat bhejo messages! Thoda chai pi ke aao. 15 minute baad try karo ☕"
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// ✅ Rate limiter for verify endpoint
const verifyLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // Max 20 verify requests per 5 minutes
    message: {
        error: "Too many verification attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Apply rate limiters to routes
// router.post("/pdf/upload", uploadLimiter, upload.single("pdf"), Controller.upload);
router.post("/website/process", websiteLimiter, Controller.websiteProcess);
router.post("/chat", chatLimiter, Controller.pdfquery);
router.get("/verify", verifyLimiter, Controller.verify);
export default router;
//# sourceMappingURL=route.js.map