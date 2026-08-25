import type { Request, Response } from "express";

export class PagesController {
  // TODO: implement list(), create(), getById(), update(), archive() handlers
  healthCheck(_req: Request, res: Response): void {
    res.json({ module: "pages", status: "ok" });
  }
}

export const pagesController = new PagesController();
