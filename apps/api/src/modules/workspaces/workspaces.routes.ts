import { Router } from "express";
import { workspacesController } from "./workspaces.controller.js";
import { authGuard } from "../../middleware/auth-guard.js";
import { validate } from "../../middleware/validate.js";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceParamsSchema,
} from "./workspaces.validation.js";

export const workspacesRouter = Router();

// Protect all workspace routes with authGuard
workspacesRouter.use(authGuard);

// GET /api/workspaces - List all workspaces for logged-in user
workspacesRouter.get("/", (req, res, next) => workspacesController.list(req, res, next));

// POST /api/workspaces - Create a new workspace
workspacesRouter.post("/", validate(createWorkspaceSchema, "body"), (req, res, next) =>
  workspacesController.create(req, res, next),
);

// GET /api/workspaces/:workspaceId - Get workspace details
workspacesRouter.get("/:workspaceId", validate(workspaceParamsSchema, "params"), (req, res, next) =>
  workspacesController.getById(req, res, next),
);

// PATCH /api/workspaces/:workspaceId - Update workspace name
workspacesRouter.patch(
  "/:workspaceId",
  validate(workspaceParamsSchema, "params"),
  validate(updateWorkspaceSchema, "body"),
  (req, res, next) => workspacesController.update(req, res, next),
);

// DELETE /api/workspaces/:workspaceId - Delete workspace
workspacesRouter.delete(
  "/:workspaceId",
  validate(workspaceParamsSchema, "params"),
  (req, res, next) => workspacesController.delete(req, res, next),
);
