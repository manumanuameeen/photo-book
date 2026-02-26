import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware.ts";

export interface IHelpController {
    getAllHelp(req: AuthRequest, res: Response): Promise<void>;
    getHelpByCategory(req: AuthRequest, res: Response): Promise<void>;
    createHelpSection(req: AuthRequest, res: Response): Promise<void>;
    updateHelpSection(req: AuthRequest, res: Response): Promise<void>;
    deleteHelpSection(req: AuthRequest, res: Response): Promise<void>;
    reorderHelpSections(req: AuthRequest, res: Response): Promise<void>;
}
