// app/sitemap.xml/route.ts
import { type MetadataRoute } from 'next';

const slugify = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export async function GET(): Promise<MetadataRoute.Sitemap> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/university_meta`);
  const universities = await res.json();

  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

  const routes = universities.map((uni: any) => ({
    url: `${baseUrl}/network/${slugify(uni.university_name)}`,
    lastModified: new Date().toISOString(),
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString(),
    },
    ...routes,
  ];
}
