import axios from "axios";
import * as cheerio from "cheerio";
import { Document } from "@langchain/core/documents";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantClient } from "@qdrant/js-client-rest";

const COLLECTION_NAME = "web_docs";

const qdrantUrl = process.env.QDRANT_URL!;
const apiKey = process.env.QDRANT_API_KEY!;

// init client
const client = new QdrantClient({ url: qdrantUrl, apiKey });

export class WebsiteIndexService {

  static async resetCollection() {
    try {
      await client.deleteCollection(COLLECTION_NAME);
    } catch (err) {
      console.log("web_docs not found, skipping delete");
    }

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

  static async fetchPageText(url: string) {
    const res = await axios.get(url);

    const $ = cheerio.load(res.data);
    $("script, style, nav, footer, header").remove();

    const text = $("body").text().replace(/\s+/g, " ").trim();

    return text;
  }

  static async indexWebsite(websiteId: string, url: string) {
    await this.resetCollection();

    const text = await this.fetchPageText(url);

    if (!text) throw new Error("No text extracted from website");

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
      apiKey: process.env.OPENAI_API_KEY!,
      model: "text-embedding-3-small",
    });

    await QdrantVectorStore.fromDocuments(docs, embeddings, {
      url: qdrantUrl,
      apiKey: apiKey,
      collectionName: COLLECTION_NAME,
    });

    return {
      pagesIndexed: 1,
      chunksStored: chunks.length,
    };
  }
}
