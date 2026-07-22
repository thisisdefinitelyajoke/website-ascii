const path = require('path');
const axios = require('axios');
const fs = require('fs').promises;
const fssync = require('fs');

const revFile = path.join(__dirname, '..', 'catalog-revision.txt');
const catalogFile = path.join(__dirname, '..', 'src', 'db', 'catalog.json');

const REPO = 'thisisdefinitelyajoke/database-ascii';
const LOCAL_DB = path.join(__dirname, '..', '..', 'database-ascii');
const LOCAL_DB_CATALOG = path.join(LOCAL_DB, 'db', 'catalog.json');
const API_REV = `https://api.github.com/repos/${REPO}/commits?path=db/catalog.json`;
const RAW_CATALOG = `https://raw.githubusercontent.com/${REPO}/master/db/catalog.json`;

async function getDistantRev() {
  return (await axios.get(API_REV)).data[0].sha;
}

async function checkNeedUpdate() {
  const currentRev = (await fs.readFile(revFile, 'utf-8')).trim();
  const distantRev = await getDistantRev();
  console.log(`currentRev: ${currentRev}`);
  console.log(`distantRev: ${distantRev}`);
  if (currentRev !== distantRev) {
    console.log('Need to update DB');
    return true;
  }
  console.log('No need to update');
  return false;
}

async function updateDb(revision) {
  let catalog;

  if (fssync.existsSync(LOCAL_DB_CATALOG)) {
    console.log('Copying catalog.json from local database-ascii repo...');
    catalog = fssync.readFileSync(LOCAL_DB_CATALOG, 'utf-8');
  } else {
    console.log('Downloading catalog.json from GitHub...');
    const res = await axios.get(RAW_CATALOG, { responseType: 'text' });
    catalog = res.data;
  }

  fssync.mkdirSync(path.dirname(catalogFile), { recursive: true });
  fssync.writeFileSync(catalogFile, catalog);
  await fs.writeFile(revFile, revision);
  console.log('Updated catalog.json');
}

module.exports = {
  checkNeedUpdate,
  getDistantRev,
  updateDb,
  revFile,
};
