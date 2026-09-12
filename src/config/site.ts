import { siteConfig as rawSiteConfig } from "@/../site.config";

export const siteConfig = {
  ...rawSiteConfig,
  name: rawSiteConfig.brand.name,
  tagline: rawSiteConfig.brand.tagline,
  description: rawSiteConfig.seo.description,
  url: rawSiteConfig.seo.siteUrl,
  ogImage: rawSiteConfig.seo.ogImage,
  dropDate: rawSiteConfig.drop.date,
  navLinks: rawSiteConfig.navigation,
  footerLinks: rawSiteConfig.footerGroups,
  colors: rawSiteConfig.brand.colors,
  fonts: rawSiteConfig.brand.fonts,
};

export type SiteConfig = typeof siteConfig;
export default siteConfig;
