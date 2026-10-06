const { getDynamicSitemapPaths } = require('./scripts/getSitemapPaths.js');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.collegeathletenetwork.org', 
  generateRobotsTxt: true, // Generate robots.txt file
  sitemapSize: 10000, // Adjust if needed
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/admin', '/admin/*', '/t/*', '/api/*'],
  additionalPaths: async (config) => {
    return await getDynamicSitemapPaths();
  },
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/t/', '/api/tickets'] },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
    ],
    additionalSitemaps: [
      'https://www.collegeathletenetwork.org/server-sitemap.xml',
    ],
  },
};
