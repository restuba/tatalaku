import type { Request, Response, NextFunction } from "express";
import { pagesService } from "./pages.service.js";
import type { ListPagesQuery } from "./pages.validation.js";

export class PagesController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListPagesQuery;
      const pages = await pagesService.list(req.user!.id, query);
      res.status(200).json({ success: true, data: pages });
    } catch (err) {
      next(err);
    }
  }

  async getChildren(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageId = req.params["pageId"] as string;
      const children = await pagesService.getChildren(pageId, req.user!.id);
      res.status(200).json({ success: true, data: children });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = await pagesService.create(req.user!.id, req.body);
      res.status(201).json({ success: true, data: page });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageId = req.params["pageId"] as string;
      const page = await pagesService.getById(pageId, req.user!.id);
      res.status(200).json({ success: true, data: page });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageId = req.params["pageId"] as string;
      const page = await pagesService.update(pageId, req.user!.id, req.body);
      res.status(200).json({ success: true, data: page });
    } catch (err) {
      next(err);
    }
  }

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageId = req.params["pageId"] as string;
      const page = await pagesService.archive(pageId, req.user!.id);
      res.status(200).json({ success: true, data: page });
    } catch (err) {
      next(err);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pageId = req.params["pageId"] as string;
      const page = await pagesService.restore(pageId, req.user!.id);
      res.status(200).json({ success: true, data: page });
    } catch (err) {
      next(err);
    }
  }
}

export const pagesController = new PagesController();
