function textToSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/\s*&\s*/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

export const getUniqueUniversityMeta = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/publicprod/university_meta`,
    {
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch university_meta: ${res.status}`);
  }

  const data = await res.json();

  // Keep only the first entry for each university_name, then add a `slug` field
  const seen = new Set<string>();
  const unique = data
    .filter((item: any) => {
      if (seen.has(item.university_name)) return false;
      seen.add(item.university_name);
      return true;
    })
    .map((item: any) => ({
      ...item,
      slug: textToSlug(item.university_name),
    }));

  return unique;
};
