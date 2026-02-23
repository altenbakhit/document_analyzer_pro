import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const templates = await prisma.templateDocument.findMany({
    select: {
      titleRu: true,
      descriptionRu: true,
      category: true,
      contractHtml: true,
    },
    where: { contractHtml: { not: null } },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const outPath = path.resolve(__dirname, "templates-seed.json");
  fs.writeFileSync(outPath, JSON.stringify(templates, null, 2));
  console.log(`Exported ${templates.length} templates to ${outPath}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
