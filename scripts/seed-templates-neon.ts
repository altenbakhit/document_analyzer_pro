/**
 * Seed templates to production Neon database.
 * Run with:  DATABASE_URL="postgresql://..." npx tsx scripts/seed-templates-neon.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const seedPath = path.resolve(__dirname, "templates-seed.json");
  if (!fs.existsSync(seedPath)) {
    console.error("templates-seed.json not found. Run export-templates.ts first.");
    process.exit(1);
  }

  const templates = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  console.log(`Seeding ${templates.length} templates to production DB...\n`);

  for (const t of templates) {
    const created = await prisma.templateDocument.create({ data: t });
    console.log(`  ✓ ${created.id} — ${t.titleRu}`);
  }

  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
