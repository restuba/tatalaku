import type { Request, Response, NextFunction } from "express";
import { blocksService } from "./blocks.service.js";

export class BlocksController {
  async listByPage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageId = req.params["pageId"] as string;
      const blocks = await blocksService.listByPage(pageId, req.user!.id);
      res.status(200).json({ success: true, data: blocks });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const block = await blocksService.create(req.user!.id, req.body);
      res.status(201).json({ success: true, data: block });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const blockId = req.params["blockId"] as string;
      const block = await blocksService.update(blockId, req.user!.id, req.body);
      res.status(200).json({ success: true, data: block });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const blockId = req.params["blockId"] as string;
      await blocksService.delete(blockId, req.user!.id);
      res.status(200).json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const blocks = await blocksService.reorder(req.user!.id, req.body);
      res.status(200).json({ success: true, data: blocks });
    } catch (err) {
      next(err);
    }
  }

  async batchSync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageId = req.params["pageId"] as string;
      const blocks = await blocksService.batchSync(pageId, req.user!.id, req.body);
      res.status(200).json({ success: true, data: blocks });
    } catch (err) {
      next(err);
    }
  }
}

export const blocksController = new BlocksController();
