export declare class WebsiteIndexService {
    static resetCollection(): Promise<void>;
    static chunkText(text: string, chunkSize?: number, overlap?: number): string[];
    static fetchPageText(url: string): Promise<string>;
    static indexWebsite(websiteId: string, url: string): Promise<{
        pagesIndexed: number;
        chunksStored: number;
    }>;
}
//# sourceMappingURL=websiteIndex.service.d.ts.map