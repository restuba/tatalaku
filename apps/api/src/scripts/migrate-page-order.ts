/**
 * One-off, idempotent migration: give every page an explicit `order`.
 *
 * Pages created before ordering existed have no `order` field. For each
 * sibling group (workspaceId + parentPageId) that still contains such pages,
 * renumber the whole group 0..n-1 in its current display order
 * (order asc — missing sorts first — then createdAt, then _id), so nothing
 * visibly moves. Groups where every page already has an order are untouched.
 *
 * Run (dev):  pnpm --filter @tatalaku/api migrate:page-order
 * Run (prod): node dist/scripts/migrate-page-order.js
 */
import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { PageModel } from "../modules/pages/pages.model.js";

interface SiblingGroup {
  _id: { workspaceId: string; parentPageId: string | null };
}

async function main(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, { autoIndex: false });

  const groups = await PageModel.aggregate<SiblingGroup>([
    { $match: { order: { $exists: false } } },
    {
      $group: {
        _id: { workspaceId: "$workspaceId", parentPageId: { $ifNull: ["$parentPageId", null] } },
      },
    },
  ]);

  let updated = 0;
  for (const { _id: group } of groups) {
    const siblings = await PageModel.find(
      { workspaceId: group.workspaceId, parentPageId: group.parentPageId },
      { _id: 1 },
    )
      .sort({ order: 1, createdAt: 1, _id: 1 })
      .lean();

    if (siblings.length === 0) continue;
    await PageModel.bulkWrite(
      siblings.map((page, index) => ({
        updateOne: { filter: { _id: page._id }, update: { $set: { order: index } } },
      })),
      { ordered: false },
    );
    updated += siblings.length;
  }

  const remaining = await PageModel.countDocuments({ order: { $exists: false } });
  console.log(
    `renumbered ${updated} page(s) in ${groups.length} sibling group(s); pages without order: ${remaining}`,
  );
}

main()
  .catch((err: unknown) => {
    console.error("migration failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
