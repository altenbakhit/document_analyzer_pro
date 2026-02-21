import { Metadata } from "next";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { BlogPostContent } from "./blog-post-content";

const prisma = new PrismaClient();

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) return { title: "Not Found" };

  const title = post.titleRu || post.titleEn || "Статья";
  const description = (post.contentRu || post.contentEn || "").slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(post.imageUrl ? { images: [post.imageUrl] } : {}),
      publishedTime: post.createdAt.toISOString(),
      ...(post.author ? { authors: [post.author] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.imageUrl ? { images: [post.imageUrl] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({
    where: { id: params.id, published: true },
  });

  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.titleRu || post.titleEn || "",
    ...(post.imageUrl ? { image: post.imageUrl } : {}),
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    ...(post.author ? { author: { "@type": "Person", name: post.author } } : {}),
    publisher: {
      "@type": "Organization",
      name: "Alten Consulting",
      url: "https://alten.kz",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostContent post={{
        id: post.id,
        titleKk: post.titleKk,
        titleRu: post.titleRu,
        titleEn: post.titleEn,
        titleZh: post.titleZh,
        contentKk: post.contentKk,
        contentRu: post.contentRu,
        contentEn: post.contentEn,
        contentZh: post.contentZh,
        author: post.author,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt.toISOString(),
      }} />
    </>
  );
}
