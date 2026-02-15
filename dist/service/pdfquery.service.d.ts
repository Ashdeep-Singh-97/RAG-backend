export declare class PdfQueryService {
    static askQuestion(question: string, collectionName: string): Promise<{
        answer: string | (import("@langchain/core/messages").ContentBlock | import("@langchain/core/messages").ContentBlock.Text)[];
        sources: Record<string, any>[];
    }>;
}
//# sourceMappingURL=pdfquery.service.d.ts.map