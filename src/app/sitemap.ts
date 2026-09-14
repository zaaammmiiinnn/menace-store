import { siteConfig } from "@/config/site";
import { products } from "@/data/products";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.seo?.siteUrl || "https://menance.store";

  const staticPages = [
    "",
    "/shop",
    "/checkout",
    "/about",
    "/lookbook",
    "/drops",
    "/size-guide",
    "/faq",
    "/shipping",
    "/contact",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("daily" as const) : ("weekly" as const),
    priority: route === "" ? 1.0 : route === "/shop" ? 0.9 : 0.7,
  }));

  const productPages = products.map((product) => ({
    url: `${baseUrl}/shop/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...productPages];
}
