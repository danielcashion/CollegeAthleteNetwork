import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.collegeathletenetwork.org",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.collegeathletenetwork.org/communications",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.collegeathletenetwork.org/sample-data",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://www.collegeathletenetwork.org/athlete-checklists",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://www.collegeathletenetwork.org/corporate-partners",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.collegeathletenetwork.org/data-transparency",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.collegeathletenetwork.org/about-us",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    // Add more URLs as needed
  ];
} 