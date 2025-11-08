import { Request, Response } from "express";

export interface IAdminController {
    getAllUser(req: Request, res: Response): Promise<void>
    getUserId(req: Request, res: Response): Promise<void>
    blockUser(req: Request, res: Response): Promise<void>;
    unblockUser(req: Request, res: Response): Promise<void>;
}
