import { Router } from "express";
import { pagesController } from "./pages.controller.js";
import { authGuard } from "../../middleware/auth-guard.js";
import { validate } from "../../middleware/validate.js";
import {
  createPageSchema,
  updatePageSchema,
  pageParamsSchema,
  listPagesQuerySchema,
} from "./pages.validation.js";

export const pagesRouter = Router();

// Protect all page routes with authGuard
pagesRouter.use(authGuard);

// GET /api/pages - List pages in workspace (supports workspaceId, parentPageId, includeArchived query)
pagesRouter.get("/", validate(listPagesQuerySchema, "query"), (req, res, next) =>
  pagesController.list(req, res, next),
);

// POST /api/pages - Create a new page
pagesRouter.post("/", validate(createPageSchema, "body"), (req, res, next) =>
  pagesController.create(req, res, next),
);

// GET /api/pages/:pageId/children - Get subpages of a page
pagesRouter.get("/:pageId/children", validate(pageParamsSchema, "params"), (req, res, next) =>
  pagesController.getChildren(req, res, next),
);

// GET /api/pages/:pageId - Get page details
pagesRouter.get("/:pageId", validate(pageParamsSchema, "params"), (req, res, next) =>
  pagesController.getById(req, res, next),
);

// PATCH /api/pages/:pageId - Update page metadata
pagesRouter.patch(
  "/:pageId",
  validate(pageParamsSchema, "params"),
  validate(updatePageSchema, "body"),
  (req, res, next) => pagesController.update(req, res, next),
);

// DELETE /api/pages/:pageId - Soft delete / archive a page
pagesRouter.delete("/:pageId", validate(pageParamsSchema, "params"), (req, res, next) =>
  pagesController.archive(req, res, next),
);

// POST /api/pages/:pageId/restore - Restore an archived page
pagesRouter.post("/:pageId/restore", validate(pageParamsSchema, "params"), (req, res, next) =>
  pagesController.restore(req, res, next),
);
