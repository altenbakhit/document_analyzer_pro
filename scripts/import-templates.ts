import { PrismaClient } from "@prisma/client";
import mammoth from "mammoth";
import path from "path";

const prisma = new PrismaClient();

// ── Placeholder auto-detection ──────────────────────────────────────
function autoMarkFields(html: string): string {
  let idx = 0;
  const next = (ph: string) => `{{FIELD:field${++idx}:${ph}}}`;

  html = html.replace(/«_{3,}»/g, () => next("введите значение"));
  html = html.replace(/\[_{3,}\]/g, () => next("введите значение"));
  html = html.replace(/\[([^\]]{2,60})\]/g, (_, ph) => next(ph.trim()));
  html = html.replace(/_{4,}/g, () => next("введите значение"));

  return html;
}

// ── Templates metadata ──────────────────────────────────────────────
const TEMPLATES = [
  {
    file: "Договор купли продажи.docx",
    titleRu: "Договор купли-продажи",
    descriptionRu: "Стандартный договор купли-продажи товара между двумя сторонами.",
    category: "Гражданское право",
  },
  {
    file: "Договор оказания услуг.docx",
    titleRu: "Договор оказания услуг",
    descriptionRu: "Договор на оказание услуг между заказчиком и исполнителем.",
    category: "Гражданское право",
  },
  {
    file: "Договор транспортной перевозки.docx",
    titleRu: "Договор транспортной перевозки",
    descriptionRu: "Договор перевозки груза транспортным средством.",
    category: "Транспортное право",
  },
  {
    file: "Договор хранения товаров на складе.docx",
    titleRu: "Договор хранения товаров на складе",
    descriptionRu: "Договор на хранение товаров на складе хранителя.",
    category: "Гражданское право",
  },
  {
    file: "Договор подряда.docx",
    titleRu: "Договор подряда",
    descriptionRu: "Договор подряда на выполнение работ между заказчиком и подрядчиком.",
    category: "Гражданское право",
  },
  {
    file: "Договор поставки.docx",
    titleRu: "Договор поставки",
    descriptionRu: "Договор поставки товаров между поставщиком и покупателем.",
    category: "Гражданское право",
  },
  {
    file: "Договор займа.docx",
    titleRu: "Договор займа",
    descriptionRu: "Договор займа денежных средств между займодавцем и заёмщиком.",
    category: "Финансовое право",
  },
  {
    file: "Договор аренды имущества.docx",
    titleRu: "Договор аренды имущества",
    descriptionRu: "Договор аренды имущества между арендодателем и арендатором.",
    category: "Гражданское право",
  },
];

const DOCX_DIR = path.resolve(__dirname, "../../Templates_contract_All");

async function main() {
  console.log("Importing templates from Word documents...\n");

  for (const meta of TEMPLATES) {
    const filePath = path.join(DOCX_DIR, meta.file);
    console.log(`Processing: ${meta.file}`);

    try {
      const result = await mammoth.convertToHtml(
        { path: filePath },
        {
          styleMap: [
            "p[style-name='Heading 1'] => p.section-title:fresh",
            "p[style-name='Heading 2'] => p.section-title:fresh",
            "b => strong",
          ],
        }
      );

      const contractHtml = autoMarkFields(result.value);

      if (result.messages.length > 0) {
        console.log(
          `  Warnings: ${result.messages.map((m) => m.message).join(", ")}`
        );
      }

      const created = await prisma.templateDocument.create({
        data: {
          titleRu: meta.titleRu,
          descriptionRu: meta.descriptionRu,
          category: meta.category,
          contractHtml,
        },
      });

      console.log(`  ✓ Created template: ${created.id} — ${meta.titleRu}\n`);
    } catch (err) {
      console.error(`  ✗ Error processing ${meta.file}:`, err);
    }
  }

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
