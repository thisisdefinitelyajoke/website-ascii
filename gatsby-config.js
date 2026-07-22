const plugins = [
  {
    resolve: 'gatsby-plugin-google-analytics',
    options: {
      trackingId: 'UA-169271859-1',
      head: false,
      anonymize: true,
    },
  },
  'gatsby-plugin-pnpm',
  'gatsby-plugin-next-seo',
  {
    resolve: 'gatsby-plugin-sitemap',
    options: {
      output: '/sitemap.xml',
      query: `
      {
        allSitePage {
          nodes {
            path
          }
        }
    }`,
      resolveSiteUrl: () => 'https://thisisdefinitelyajoke.github.io/database-ascii/',
      serialize: ({ path }) => {
        // Forced to due this because of Github pages default behaviour
        // otherwise the server returns a 301 HTTP code.
        let url = path;
        if (!url.endsWith('/')) {
          url += '/';
        }
        return {
          url: `https://thisisdefinitelyajoke.github.io/database-ascii${url}`,
          changefreq: 'daily',
          priority: 0.7,
        };
      },
    },
  },
  {
    resolve: 'gatsby-plugin-robots-txt',
    options: {
      host: 'https://thisisdefinitelyajoke.github.io/database-ascii/',
      sitemap: 'https://thisisdefinitelyajoke.github.io/database-ascii/sitemap.xml',
      policy: [{ userAgent: '*', allow: '/' }],
    },
  },
  {
    resolve: 'gatsby-plugin-canonical-urls',
    options: {
      siteUrl: 'https://thisisdefinitelyajoke.github.io/database-ascii/',
    },
  },
  'gatsby-plugin-postcss',
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'images',
      path: `${__dirname}/src/assets/img`,
    },
  },
  'gatsby-plugin-image',
  'gatsby-plugin-sharp',
  'gatsby-transformer-sharp',
  'gatsby-transformer-remark',
  {
    resolve: 'gatsby-omni-font-loader',
    options: {
      enableListener: true,
      preconnect: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
      web: [
        {
          name: 'Inter',
          file: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
];

// Purge CSS for prod deployement
if (process.env.TARGET === 'PROD') {
  plugins.push('gatsby-plugin-no-sourcemaps');
}

module.exports = {
  pathPrefix: '/website-ascii-bin',
  siteMetadata: {
    title: 'Keycap Asciivist',
    description: 'ASCII art gallery of keycap-archivist.com',
    author: '@keycap-archivist',
    siteUrl: 'https://thisisdefinitelyajoke.github.io/database-ascii/',
    generationDate: new Date(),
  },
  plugins,
};
