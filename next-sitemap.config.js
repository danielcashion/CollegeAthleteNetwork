/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.collegeathletenetwork.org', 
  generateRobotsTxt: true, // Generate robots.txt file
  sitemapSize: 10000, // Adjust if needed
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/admin'], // Excluded pages
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
    ],
    additionalSitemaps: [
      'https://www.collegeathletenetwork.org/server-sitemap.xml',
    ],
  },
};
