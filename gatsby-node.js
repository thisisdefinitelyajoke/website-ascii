/* eslint-disable no-param-reassign */
const slugify = require('slugify');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const webpack = require('webpack');

const db = JSON.parse(fs.readFileSync('./src/db/catalog.json'));

const slug = (d) => slugify(d, { replacement: '-', remove: /[#,.:?()'"/]/g, lower: true }).toLowerCase();

const ASCII_SRC = './src/db';
const ASCII_DEST = './static/ascii';

function copyAsciiFiles() {
  if (!fs.existsSync(ASCII_SRC)) return;
  fs.mkdirSync(ASCII_DEST, { recursive: true });
  const files = fs.readdirSync(ASCII_SRC).filter((f) => f.endsWith('.ascii.json'));
  for (const file of files) {
    fs.copyFileSync(path.join(ASCII_SRC, file), path.join(ASCII_DEST, file));
  }
}

exports.createPages = async ({ actions }) => {
  const { createPage } = actions;
  const makerTpl = require.resolve('./src/pages-dynamic/maker.js');
  const cwTpl = require.resolve('./src/pages-dynamic/colorway.js');
  const sculptTpl = require.resolve('./src/pages-dynamic/sculpt.js');

  // Copy ascii files to static/ for client-side loading
  copyAsciiFiles();

  db.forEach((maker) => {
    maker.sculpts.forEach((element) => {
      element.link = `/maker/${slug(maker.name)}/${slug(element.name)}`;
    });
    const makerLightObj = _.cloneDeep(maker);
    makerLightObj.sculpts.forEach((s) => {
      s.previewCwId = s.colorways?.[0]?.id || null;
      delete s.colorways;
    });
    const makerUrl = `/maker/${slug(maker.name)}`;
    createPage({
      path: makerUrl,
      component: makerTpl,
      context: {
        maker: makerLightObj,
        selfOrder: maker.selfOrder,
        type: 'maker',
        slug: makerUrl,
      },
    });
    maker.sculpts.forEach((sculpt) => {
      const outMaker = {
        ...maker,
      };
      delete outMaker.sculpts;

      createPage({
        path: sculpt.link,
        component: sculptTpl,
        context: {
          makerUrl,
          denySubmission: maker.denySubmission,
          selfOrder: maker.selfOrder,
          type: 'sculpt',
          sculpt,
          maker: outMaker,
          slug: sculpt.link,
        },
      });
      sculpt.colorways.forEach((cw) => {
        createPage({
          path: `${sculpt.link}/${cw.id}`,
          component: cwTpl,
          context: {
            makerUrl,
            makerName: maker.name,
            sculptName: sculpt.name,
            sculptUrl: sculpt.link,
            type: 'colorway',
            colorway: cw,
            slug: `${sculpt.link}/${cw.id}`,
          },
        });
      });
    });
  });
};

exports.onCreateWebpackConfig = async ({ actions, plugins }) => {
  const revision = fs.readFileSync(path.join(__dirname, 'catalog-revision.txt'), 'utf-8');
  actions.setWebpackConfig({
    resolve: { fallback: { process: require.resolve('process/browser') } },
    plugins: [
      plugins.define({ DBREV: JSON.stringify(revision) }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process',
      }),
    ],
  });
};
