/**
 * Daily Mongo backup of critical collections (portable, no mongodump required).
 *
 * Run once:
 *   node backend/script/backupMongo.js
 *
 * Cron / Task Scheduler (daily 2 AM):
 *   0 2 * * * cd /path/to/backend && node script/backupMongo.js
 *
 * Keeps last BACKUP_RETENTION_DAYS (default 14) of local backups.
 */
require("../config/env");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");

const COLLECTIONS = [
  "orders",
  "payments",
  "paymentlogs",
  "auditlogs",
  "webhookevents",
  "customers",
  "products",
  "settings",
  "coupons",
];

const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS || 14);
const backupRoot = path.resolve(
  process.env.BACKUP_DIR || path.join(__dirname, "../backups")
);

const stamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(
    d.getHours()
  )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const pruneOldBackups = () => {
  if (!fs.existsSync(backupRoot)) return;
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  for (const name of fs.readdirSync(backupRoot)) {
    const full = path.join(backupRoot, name);
    try {
      const stat = fs.statSync(full);
      if (stat.isDirectory() && stat.mtimeMs < cutoff) {
        fs.rmSync(full, { recursive: true, force: true });
        console.log("Pruned old backup:", name);
      }
    } catch (err) {
      console.warn("Prune skip:", name, err.message);
    }
  }
};

async function dumpCollection(db, name, outDir) {
  try {
    const exists = await db.listCollections({ name }).hasNext();
    if (!exists) {
      console.log(`~ skip missing collection: ${name}`);
      return { name, count: 0, skipped: true };
    }
    const docs = await db.collection(name).find({}).toArray();
    const file = path.join(outDir, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(docs, null, 2), "utf8");
    console.log(`✓ ${name}: ${docs.length} docs`);
    return { name, count: docs.length };
  } catch (err) {
    console.error(`✗ ${name}:`, err.message);
    return { name, error: err.message };
  }
}

async function main() {
  console.log("=== Mongo Daily Backup ===\n");
  await connectDB();

  const outDir = path.join(backupRoot, stamp());
  ensureDir(outDir);

  const db = mongoose.connection.db;
  const summary = [];
  for (const name of COLLECTIONS) {
    summary.push(await dumpCollection(db, name, outDir));
  }

  fs.writeFileSync(
    path.join(outDir, "_manifest.json"),
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        collections: summary,
        monoUriHost: String(process.env.MONGO_URI || "")
          .replace(/\/\/.*@/, "//***@")
          .slice(0, 120),
      },
      null,
      2
    )
  );

  pruneOldBackups();
  await mongoose.connection.close();
  console.log(`\n✅ Backup saved to: ${outDir}`);
}

main().catch(async (err) => {
  console.error("❌ Backup failed:", err.message);
  try {
    await mongoose.connection.close();
  } catch (_) {}
  process.exit(1);
});
