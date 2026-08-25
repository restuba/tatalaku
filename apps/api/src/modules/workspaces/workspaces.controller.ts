import type { Request, Response, NextFunction } from "express";
import type { PaginationQuery } from "@tatalaku/shared";
import { workspacesService } from "./workspaces.service.js";

export class WorkspacesController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as PaginationQuery;
      const workspaces = await workspacesService.listForUser(req.user!.id, query);
      res.status(200).json({ success: true, data: workspaces.data, meta: workspaces.meta });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspace = await workspacesService.create(req.user!.id, req.body);
      res.status(201).json({ success: true, data: workspace });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const workspace = await workspacesService.getById(workspaceId, req.user!.id);
      res.status(200).json({ success: true, data: workspace });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const workspace = await workspacesService.update(workspaceId, req.user!.id, req.body);
      res.status(200).json({ success: true, data: workspace });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      await workspacesService.delete(workspaceId, req.user!.id);
      res.status(200).json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  }
}

export const workspacesController = new WorkspacesController();
