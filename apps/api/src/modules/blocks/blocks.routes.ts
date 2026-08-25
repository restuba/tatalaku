import { Router } from "express";
import { blocksController } from "./blocks.controller.js";

export const blocksRouter = Router();

// TODO: add GET /page/:pageId, POST /, PATCH /:blockId, DELETE /:blockId, PATCH /reorder
blocksRouter.get("/health", (req, res) => blocksController.healthCheck(req, res));
