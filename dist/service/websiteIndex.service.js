import axios from "axios";
import * as cheerio from "cheerio";
import { Document } from "@langchain/core/documents";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantClient } from "@qdrant/js-client-rest";
const COLLECTION_NAME = "web_docs";
export class WebsiteIndexService {
    static async resetCollection() {
        const client = new QdrantClient({
            url: process.env.QDRANT_URL || "http://localhost:6333",
        });
        try {
            await client.deleteCollection(COLLECTION_NAME);
        }
        catch (err) {
            console.log("web_docs not found, skipping delete");
        }
        await client.createCollection(COLLECTION_NAME, {
            vectors: { size: 1536, distance: "Cosine" },
        });
    }
    static chunkText(text, chunkSize = 1000, overlap = 200) {
        const chunks = [];
        let start = 0;
        while (start < text.length) {
            const end = start + chunkSize;
            chunks.push(text.slice(start, end));
            start += chunkSize - overlap;
        }
        return chunks;
    }
    static async fetchPageText(url) {
        const res = await axios.get(url);
        const $ = cheerio.load(res.data);
        $("script, style, nav, footer, header").remove();
        const text = $("body").text().replace(/\s+/g, " ").trim();
        return text;
    }
    static async indexWebsite(websiteId, url) {
        await this.resetCollection();
        const text = await this.fetchPageText(url);
        if (!text)
            throw new Error("No text extracted from website");
        const chunks = this.chunkText(text);
        const docs = chunks.map((chunk, index) => {
            return new Document({
                pageContent: chunk,
                metadata: {
                    websiteId,
                    url,
                    chunkIndex: index,
                    source: "web",
                },
            });
        });
        const embeddings = new OpenAIEmbeddings({
            apiKey: process.env.OPENAI_API_KEY,
            model: "text-embedding-3-small",
        });
        await QdrantVectorStore.fromDocuments(docs, embeddings, {
            url: process.env.QDRANT_URL || "http://localhost:6333",
            collectionName: COLLECTION_NAME,
        });
        return {
            pagesIndexed: 1,
            chunksStored: chunks.length,
        };
    }
}
//# sourceMappingURL=websiteIndex.service.js.map