import mongoose from "mongoose";
import type { Block } from "@tatalaku/shared";
import { BlockModel, type BlockDocument } from "./blocks.model.js";
import { PageModel } from "../pages/pages.model.js";
import { WorkspaceModel } from "../workspaces/workspaces.model.js";
import { ForbiddenError, NotFoundError } from "../../utils/errors.js";
import type {
  CreateBlockInput,
  UpdateBlockInput,
  ReorderBlocksInput,
  BatchSyncBlocksInput,
} from "./blocks.validation.js";

function toBlockResponse(doc: BlockDocument): Block {
  return {
    id: doc._id.toString(),
    pageId: doc.pageId,
    type: doc.type,
    content: doc.content ?? null,
    order: doc.order,
    parentBlockId: doc.parentBlockId ?? null,
  };
}

export class BlocksService {
  /**
   * Helper: verify user has access to the page's workspace
   */
  private async assertPageAccess(pageId: string, userId: string): Promise<void> {
    const page = await PageModel.findById(pageId);
    if (!page) {
      throw new NotFoundError("Page");
    }

    const workspace = await WorkspaceModel.findById(page.workspaceId);
    if (!workspace) {
      throw new NotFoundError("Workspace");
    }

    const isMember = workspace.ownerId === userId || workspace.memberIds.includes(userId);
    if (!isMember) {
      throw new ForbiddenError("You do not have access to this page");
    }
  }

  /**
   * List all blocks in a page sorted by order
   */
  async listByPage(pageId: string, userId: string): Promise<Block[]> {
    await this.assertPageAccess(pageId, userId);

    const docs = await BlockModel.find({ pageId }).sort({ order: 1 });
    return docs.map(toBlockResponse);
  }

  /**
   * Create a single new block
   */
  async create(userId: string, input: CreateBlockInput): Promise<Block> {
    await this.assertPageAccess(input.pageId, userId);

    const doc = await BlockModel.create({
      pageId: input.pageId,
      type: input.type,
      content: input.content ?? null,
      order: input.order,
      parentBlockId: input.parentBlockId ?? null,
    });

    await PageModel.findByIdAndUpdate(input.pageId, {
      $push: { blockIds: doc._id.toString() },
      $set: { updatedAt: new Date() },
    });

    return toBlockResponse(doc);
  }

  /**
   * Update an existing block
   */
  async update(blockId: string, userId: string, input: UpdateBlockInput): Promise<Block> {
    const doc = await BlockModel.findById(blockId);
    if (!doc) {
      throw new NotFoundError("Block");
    }

    await this.assertPageAccess(doc.pageId, userId);

    if (input.type !== undefined) {
      doc.type = input.type;
    }
    if (input.content !== undefined) {
      doc.content = input.content;
    }
    if (input.order !== undefined) {
      doc.order = input.order;
    }
    if (input.parentBlockId !== undefined) {
      doc.parentBlockId = input.parentBlockId;
    }

    await doc.save();
    await PageModel.findByIdAndUpdate(doc.pageId, { $set: { updatedAt: new Date() } });

    return toBlockResponse(doc);
  }

  /**
   * Delete a block and its nested children
   */
  async delete(blockId: string, userId: string): Promise<void> {
    const doc = await BlockModel.findById(blockId);
    if (!doc) {
      throw new NotFoundError("Block");
    }

    await this.assertPageAccess(doc.pageId, userId);

    // Delete this block and any child blocks
    await BlockModel.deleteMany({
      $or: [{ _id: blockId }, { parentBlockId: blockId }],
    });

    await PageModel.findByIdAndUpdate(doc.pageId, {
      $pull: { blockIds: blockId },
      $set: { updatedAt: new Date() },
    });
  }

  /**
   * Bulk reorder blocks
   */
  async reorder(userId: string, input: ReorderBlocksInput): Promise<Block[]> {
    await this.assertPageAccess(input.pageId, userId);

    const bulkOps = input.blocks.map((b) => ({
      updateOne: {
        filter: { _id: b.id, pageId: input.pageId },
        update: { $set: { order: b.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await BlockModel.bulkWrite(bulkOps);
    }

    const docs = await BlockModel.find({ pageId: input.pageId }).sort({ order: 1 });
    return docs.map(toBlockResponse);
  }

  /**
   * Batch synchronize all blocks for a page (used by debounced editor save)
   */
  async batchSync(pageId: string, userId: string, input: BatchSyncBlocksInput): Promise<Block[]> {
    await this.assertPageAccess(pageId, userId);

    const keptBlockIds: string[] = [];

    for (const item of input.blocks) {
      if (item.id && mongoose.isValidObjectId(item.id)) {
        const blockId: string = item.id;
        const existing = await BlockModel.findOne({ _id: blockId, pageId });
        if (existing) {
          existing.type = item.type;
          existing.content = item.content ?? null;
          existing.order = item.order;
          existing.parentBlockId = item.parentBlockId ?? null;
          await existing.save();
          keptBlockIds.push(existing._id.toString());
          continue;
        }
      }

      // Create new block if id is missing, temporary, or not found
      const newDoc = await BlockModel.create({
        pageId,
        type: item.type,
        content: item.content ?? null,
        order: item.order,
        parentBlockId: item.parentBlockId ?? null,
      });

      keptBlockIds.push(newDoc._id.toString());
    }

    // Delete blocks that are no longer present in the document
    await BlockModel.deleteMany({
      pageId,
      _id: { $nin: keptBlockIds },
    });

    // Update page blockIds reference and updatedAt timestamp
    await PageModel.findByIdAndUpdate(pageId, {
      $set: {
        blockIds: keptBlockIds,
        updatedAt: new Date(),
      },
    });

    const finalDocs = await BlockModel.find({ pageId }).sort({ order: 1 });
    return finalDocs.map(toBlockResponse);
  }
}

export const blocksService = new BlocksService();
