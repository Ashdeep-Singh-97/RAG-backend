import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";

dotenv.config()

const COLLECTION_NAME = "pdf_docs";

const qdrantUrl = process.env.QDRANT_URL!;
const apiKey = process.env.QDRANT_API_KEY!;

// init client
const client = new QdrantClient({ url: qdrantUrl, apiKey });

export class PdfIndexService {
  static async resetCollection() {
    
    try {
      await client.deleteCollection(COLLECTION_NAME);
    } catch (err) {
      console.log("collection not found, skipping delete");
    }

    // recreate collection
    await client.createCollection(COLLECTION_NAME, {
      vectors: { size: 1536, distance: "Cosine" },
    });
  }

  static chunkText(text: string, chunkSize = 1000, overlap = 200) {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = start + chunkSize;
      chunks.push(text.slice(start, end));
      start += chunkSize - overlap;
    }

    return chunks;
  }

  static async indexPdf(pdfId: string, pdfText: string, filename: string) {
    await this.resetCollection();

    if (!pdfText) throw new Error("No text extracted from PDF");

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
      apiKey: process.env.OPENAI_API_KEY!,
      model: "text-embedding-3-small",
    });

    await QdrantVectorStore.fromDocuments(docs, embeddings, {
          url: qdrantUrl,
          apiKey: apiKey,
          collectionName: COLLECTION_NAME,
        });

    return { chunksStored: chunks.length };
  }
}
