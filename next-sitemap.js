/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.collegiateathletenetwork.org', 
  generateRobotsTxt: true, // Generate robots.txt file
  sitemapSize: 5000, // Adjust if needed
  exclude: ['/admin'], // Excluded pages
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
    ],
    additionalSitemaps: [
      'https://www.collegiateathletenetwork.org/server-sitemap.xml',
    ],
  },
};
