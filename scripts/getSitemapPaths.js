// Helper script for next-sitemap to get dynamic routes
// This file is in CommonJS format for compatibility with next-sitemap

async function getDynamicSitemapPaths() {
  const result = [];
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiUrl) {
      console.warn('NEXT_PUBLIC_API_URL not set, skipping dynamic routes');
      return result;
    }

    // Fetch universities
    const universitiesRes = await fetch(`${apiUrl}/publicprod/university_meta`);
    
    if (!universitiesRes.ok) {
      throw new Error(`Failed to fetch universities: ${universitiesRes.status}`);
    }
    
    const universitiesData = await universitiesRes.json();
    
    // Helper function to convert text to slug
    function textToSlug(text) {
      return text
        .toLowerCase()
        .replace(/\s*&\s*/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-+|-+$)/g, "");
    }
    
    // Get unique universities with slugs
    const seen = new Set();
    const universities = universitiesData
      .filter((item) => {
        if (seen.has(item.university_name)) return false;
        seen.add(item.university_name);
        return true;
      })
      .map((item) => ({
        ...item,
        slug: textToSlug(item.university_name),
      }));

    // Fetch sports
    const sportsRes = await fetch(`${apiUrl}/publicprod/university_sport_seo`);
    
    if (!sportsRes.ok) {
      throw new Error(`Failed to fetch sports: ${sportsRes.status}`);
    }
    
    const sportsData = await sportsRes.json();
    
    // Helper function for sport slug
    function sportToSlug(sport) {
      return textToSlug(sport);
    }
    
    const sportsList = sportsData.map(({ university_name, sport }) => ({
      university_name,
      sport: sportToSlug(sport),
    }));
    
    // Add university pages
    universities.forEach((university) => {
      result.push({
        loc: `/athlete-network/${university.slug}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      });
    });
    
    // Add sport pages
    sportsList.forEach(({ university_name, sport }) => {
      const uni = universities.find(
        (u) => u.university_name === university_name
      );
      if (uni) {
        result.push({
          loc: `/athlete-network/${uni.slug}/${sport}`,
          changefreq: 'weekly',
          priority: 0.6,
          lastmod: new Date().toISOString(),
        });
      }
    });
  } catch (error) {
    console.error('Error generating additional paths for sitemap:', error);
  }
  
  return result;
}

module.exports = { getDynamicSitemapPaths };

