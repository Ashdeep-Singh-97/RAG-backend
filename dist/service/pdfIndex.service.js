import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { QdrantClient } from "@qdrant/js-client-rest";
const COLLECTION_NAME = "pdf_docs";
export class PdfIndexService {
    static async resetCollection() {
        const client = new QdrantClient({
            url: process.env.QDRANT_URL || "http://localhost:6333",
        });
        // delete collection if exists
        try {
            await client.deleteCollection(COLLECTION_NAME);
        }
        catch (err) {
            console.log("collection not found, skipping delete");
        }
        // recreate collection
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
    static async indexPdf(pdfId, pdfText, filename) {
        await this.resetCollection();
        if (!pdfText)
            throw new Error("No text extracted from PDF");
        const chunks = this.chunkText(pdfText);
        const docs = chunks.map((chunk, index) => {
            return new Document({
                pageContent: chunk,
                metadata: {
                    pdfId,
                    filename,
                    chunkIndex: index,
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
        return { chunksStored: chunks.length };
    }
}
//# sourceMappingURL=pdfIndex.service.js.map