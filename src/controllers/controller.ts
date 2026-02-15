import { type Request, type Response } from "express";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { PdfIndexService } from "../service/pdfIndex.service.js";
import { PdfQueryService } from "../service/pdfquery.service.js";
import { WebsiteIndexService } from "../service/websiteIndex.service.js";

class AIController {

    async websiteProcess(req: Request, res: Response) {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({ error: "url is required" });
            }

            const websiteId = uuidv4();

            const result = await WebsiteIndexService.indexWebsite(websiteId, url);

            return res.status(200).json({
                success: true,
                websiteId,
                url,
                pagesIndexed: result.pagesIndexed,
                chunksStored: result.chunksStored,
                message: "Website indexed successfully",
            });

        } catch (error) {
            console.log("websiteProcess error:", error);
            return res.status(500).json({ error: "Something went wrong" });
        }
    }

    async upload(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "PDF file is required" });
            }

            const pdfId = uuidv4();

            const pdfParse = (await import("pdf-parse")).default;

            const filePath = req.file.path;
            const buffer = fs.readFileSync(filePath);

            const parsed = await pdfParse(buffer);
            const pdfText = parsed.text;

            const result = await PdfIndexService.indexPdf(
                pdfId,
                pdfText,
                req.file.originalname
            );

            return res.status(200).json({
                success: true,
                pdfId,
                filename: req.file.filename,
                originalName: req.file.originalname,
                pages: parsed.numpages,
                chunksStored: result.chunksStored,
                message: "PDF uploaded & indexed successfully",
            });
        } catch (error) {
            console.log("uploadPdf error:", error);
            return res.status(500).json({ error: "Something went wrong" });
        }
    }

    async pdfquery(req: Request, res: Response) {
        try {
            const { question, source } = req.body;

            if (!question) {
                return res.status(400).json({ error: "question is required" });
            }

            const collectionName =
                source === "web" ? "web_docs" : "pdf_docs"; // default pdf

            const result = await PdfQueryService.askQuestion(question, collectionName);

            return res.status(200).json({
                success: true,
                source: source || "pdf",
                question,
                answer: result.answer,
                sources: result.sources,
            });

        } catch (error) {
            console.log("pdfquery error:", error);
            return res.status(500).json({ error: "Something went wrong" });
        }
    }

    verify(req: Request, res: Response) {
        try {
            res.status(200).json({ "verified": true });

        } catch (error) {
            console.log("error : ", error);
            res.status(401).json({ error: 'Authentication failed' });
        }
    }
}

export default AIController;