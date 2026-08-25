import { Router } from "express";
import { workspacesController } from "./workspaces.controller.js";

export const workspacesRouter = Router();

// TODO: add GET /, POST /, GET /:workspaceId, PATCH /:workspaceId, DELETE /:workspaceId
workspacesRouter.get("/health", (req, res) => workspacesController.healthCheck(req, res));
