import type { Request, Response } from "express";

export class BlocksController {
  // TODO: implement list(), create(), update(), delete(), reorder() handlers
  healthCheck(_req: Request, res: Response): void {
    res.json({ module: "blocks", status: "ok" });
  }
}

export const blocksController = new BlocksController();
