export declare class PdfIndexService {
    static resetCollection(): Promise<void>;
    static chunkText(text: string, chunkSize?: number, overlap?: number): string[];
    static indexPdf(pdfId: string, pdfText: string, filename: string): Promise<{
        chunksStored: number;
    }>;
}
//# sourceMappingURL=pdfIndex.service.d.ts.map