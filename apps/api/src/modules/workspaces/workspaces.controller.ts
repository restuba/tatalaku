import type { Request, Response } from "express";

// Workspaces controller: parses request and delegates to workspacesService.
// No business logic here.
export class WorkspacesController {
  // TODO: implement list(), create(), getById(), update(), delete() handlers
  healthCheck(_req: Request, res: Response): void {
    res.json({ module: "workspaces", status: "ok" });
  }
}

export const workspacesController = new WorkspacesController();
