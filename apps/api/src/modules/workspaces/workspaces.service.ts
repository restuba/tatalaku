import type { Workspace, PaginatedResponse, PaginationQuery } from "@tatalaku/shared";
import { WorkspaceModel, type WorkspaceDocument } from "./workspaces.model.js";
import { PageModel } from "../pages/pages.model.js";
import { ForbiddenError, NotFoundError } from "../../utils/errors.js";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "./workspaces.validation.js";

function toWorkspaceResponse(doc: WorkspaceDocument): Workspace {
  return {
    id: doc._id.toString(),
    name: doc.name,
    ownerId: doc.ownerId,
    memberIds: doc.memberIds,
    createdAt: doc.createdAt,
  };
}

export class WorkspacesService {
  /**
   * List workspaces where user is owner or member, with pagination
   */
  async listForUser(userId: string, query: PaginationQuery): Promise<PaginatedResponse<Workspace>> {
    const skip = (query.page - 1) * query.limit;
    const filter = { $or: [{ ownerId: userId }, { memberIds: userId }] };

    const [docs, total] = await Promise.all([
      WorkspaceModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
      WorkspaceModel.countDocuments(filter),
    ]);

    return {
      data: docs.map(toWorkspaceResponse),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  /**
   * Create a new workspace with userId as owner
   */
  async create(userId: string, input: CreateWorkspaceInput): Promise<Workspace> {
    const doc = await WorkspaceModel.create({
      name: input.name,
      ownerId: userId,
      memberIds: [],
    });

    return toWorkspaceResponse(doc);
  }

  /**
   * Get workspace by ID, checking authorization (must be owner or member)
   */
  async getById(workspaceId: string, userId: string): Promise<Workspace> {
    const doc = await WorkspaceModel.findById(workspaceId);
    if (!doc) {
      throw new NotFoundError("Workspace");
    }

    const isMember = doc.ownerId === userId || doc.memberIds.includes(userId);
    if (!isMember) {
      throw new ForbiddenError("You do not have access to this workspace");
    }

    return toWorkspaceResponse(doc);
  }

  /**
   * Update workspace details (only owner can update)
   */
  async update(
    workspaceId: string,
    userId: string,
    input: UpdateWorkspaceInput,
  ): Promise<Workspace> {
    const doc = await WorkspaceModel.findById(workspaceId);
    if (!doc) {
      throw new NotFoundError("Workspace");
    }

    if (doc.ownerId !== userId) {
      throw new ForbiddenError("Only the workspace owner can update workspace settings");
    }

    if (input.name !== undefined) {
      doc.name = input.name;
    }

    await doc.save();
    return toWorkspaceResponse(doc);
  }

  /**
   * Delete workspace and archive all associated pages (only owner can delete)
   */
  async delete(workspaceId: string, userId: string): Promise<void> {
    const doc = await WorkspaceModel.findById(workspaceId);
    if (!doc) {
      throw new NotFoundError("Workspace");
    }

    if (doc.ownerId !== userId) {
      throw new ForbiddenError("Only the workspace owner can delete this workspace");
    }

    // Cascade soft-delete / archive all pages in this workspace
    await PageModel.updateMany({ workspaceId }, { $set: { isArchived: true } });

    await WorkspaceModel.findByIdAndDelete(workspaceId);
  }
}

export const workspacesService = new WorkspacesService();
