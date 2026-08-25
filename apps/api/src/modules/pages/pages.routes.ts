import { Router } from "express";
import { pagesController } from "./pages.controller.js";

export const pagesRouter = Router();

// TODO: add GET /, POST /, GET /:pageId, PATCH /:pageId, DELETE /:pageId
pagesRouter.get("/health", (req, res) => pagesController.healthCheck(req, res));
