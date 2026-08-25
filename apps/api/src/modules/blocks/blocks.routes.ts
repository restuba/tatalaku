import { Router } from "express";
import { blocksController } from "./blocks.controller.js";
import { authGuard } from "../../middleware/auth-guard.js";
import { validate } from "../../middleware/validate.js";
import {
  createBlockSchema,
  updateBlockSchema,
  blockParamsSchema,
  pageBlockParamsSchema,
  reorderBlocksSchema,
  batchSyncBlocksSchema,
} from "./blocks.validation.js";

export const blocksRouter = Router();

// Protect all block routes with authGuard
blocksRouter.use(authGuard);

// GET /api/blocks/page/:pageId - Get all blocks in a page
blocksRouter.get("/page/:pageId", validate(pageBlockParamsSchema, "params"), (req, res, next) =>
  blocksController.listByPage(req, res, next),
);

// POST /api/blocks - Create a single block
blocksRouter.post("/", validate(createBlockSchema, "body"), (req, res, next) =>
  blocksController.create(req, res, next),
);

// PATCH /api/blocks/reorder - Reorder blocks within a page
blocksRouter.patch("/reorder", validate(reorderBlocksSchema, "body"), (req, res, next) =>
  blocksController.reorder(req, res, next),
);

// PATCH /api/blocks/:blockId - Update a block
blocksRouter.patch(
  "/:blockId",
  validate(blockParamsSchema, "params"),
  validate(updateBlockSchema, "body"),
  (req, res, next) => blocksController.update(req, res, next),
);

// DELETE /api/blocks/:blockId - Delete a block
blocksRouter.delete("/:blockId", validate(blockParamsSchema, "params"), (req, res, next) =>
  blocksController.delete(req, res, next),
);

// PATCH /api/blocks/page/:pageId/sync - Batch sync blocks for a page
blocksRouter.patch(
  "/page/:pageId/sync",
  validate(pageBlockParamsSchema, "params"),
  validate(batchSyncBlocksSchema, "body"),
  (req, res, next) => blocksController.batchSync(req, res, next),
);
