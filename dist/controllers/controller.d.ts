import { type Request, type Response } from "express";
declare class AIController {
    websiteProcess(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    upload(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    pdfquery(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    verify(req: Request, res: Response): void;
}
export default AIController;
//# sourceMappingURL=controller.d.ts.map