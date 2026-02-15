import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
export class PdfQueryService {
    static async askQuestion(question, collectionName) {
        const embeddings = new OpenAIEmbeddings({
            apiKey: process.env.OPENAI_API_KEY,
            model: "text-embedding-3-small",
        });
        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
            url: process.env.QDRANT_URL || "http://localhost:6333",
            collectionName: collectionName,
        });
        const results = await vectorStore.similaritySearch(question, 5);
        const context = results.map((doc) => doc.pageContent).join(" ");
        const llm = new ChatOpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            model: "gpt-4o-mini",
            temperature: 0.2,
        });
        const response = await llm.invoke(`
You are a helpful assistant.
Answer ONLY using the provided PDF context.
If answer is not found, say: "Not found in PDF".

PDF CONTEXT:
${context}

USER QUESTION:
${question}
`);
        return {
            answer: response.content,
            sources: results.map((doc) => doc.metadata),
        };
    }
}
//# sourceMappingURL=pdfquery.service.js.map