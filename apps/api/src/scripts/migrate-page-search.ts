/**
 * One-off, idempotent migration for page search:
 * 1. Backfill `plainText` from `content` for every page.
 * 2. Sync Page indexes: drop the old `title + content` text index and build
 *    the new `title + plainText` one (MongoDB allows a single text index).
 *
 * Run (dev):  pnpm --filter @tatalaku/api migrate:page-search
 * Run (prod): node dist/scripts/migrate-page-search.js
 */
import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { PageModel } from "../modules/pages/pages.model.js";
import { contentToPlainText } from "../modules/pages/pages.service.js";

const BATCH_SIZE = 500;

async function backfillPlainText(): Promise<number> {
  let updated = 0;
  let ops: mongoose.AnyBulkWriteOperation[] = [];

  const cursor = PageModel.find({}, { content: 1 }).lean().cursor();
  for await (const page of cursor) {
    ops.push({
      updateOne: {
        filter: { _id: page._id },
        update: { $set: { plainText: contentToPlainText(page.content ?? null) } },
      },
    });
    if (ops.length >= BATCH_SIZE) {
      await PageModel.bulkWrite(ops, { ordered: false });
      updated += ops.length;
      ops = [];
    }
  }
  if (ops.length > 0) {
    await PageModel.bulkWrite(ops, { ordered: false });
    updated += ops.length;
  }
  return updated;
}

async function main(): Promise<void> {
  // autoIndex off: index changes are applied explicitly by syncIndexes below
  await mongoose.connect(env.MONGODB_URI, { autoIndex: false });

  const updated = await backfillPlainText();
  console.log(`plainText backfilled for ${updated} page(s)`);

  const dropped = await PageModel.syncIndexes();
  console.log(`indexes synced${dropped.length > 0 ? `, dropped: ${dropped.join(", ")}` : ""}`);

  const indexes = await PageModel.collection.indexes();
  console.log(`current indexes: ${indexes.map((i) => i.name).join(", ")}`);
}

main()
  .catch((err: unknown) => {
    console.error("migration failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
