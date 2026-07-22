const path = require('path');
const axios = require('axios');
const fs = require('fs').promises;
const fssync = require('fs');
const { execSync } = require('child_process');

const revFile = path.join(__dirname, '..', 'catalog-revision.txt');
const catalogFile = path.join(__dirname, '..', 'src', 'db', 'catalog.json');
const ASCII_DIR = path.join(__dirname, '..', 'src', 'db');

const REPO = 'thisisdefinitelyajoke/database-ascii';
const API_REV = `https://api.github.com/repos/${REPO}/commits?path=db/catalog.json`;

async function getDistantRev() {
  return (await axios.get(API_REV)).data[0].sha;
}

async function checkNeedUpdate() {
  const currentRev = await (await fs.readFile(revFile, 'utf-8')).trim();
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

function run(cmd) {
  const out = execSync(cmd, { cwd: __dirname, encoding: 'utf-8', stdio: 'pipe' });
  return out.trim();
}

async function updateDb(revision) {
  const tmpDir = path.join(__dirname, '..', '.tmp-ascii');
  fssync.mkdirSync(tmpDir, { recursive: true });

  console.log('Cloning repository...');
  run(`git clone --depth 1 git@github.com:${REPO}.git ${tmpDir}`);

  // Copy catalog.json
  const srcCatalog = path.join(tmpDir, 'db', 'catalog.json');
  await fs.copyFile(srcCatalog, catalogFile);

  // Copy all .ascii.json files
  const srcDb = path.join(tmpDir, 'db');
  const files = fssync.readdirSync(srcDb).filter((f) => f.endsWith('.ascii.json'));
  for (const file of files) {
    await fs.copyFile(path.join(srcDb, file), path.join(ASCII_DIR, file));
  }

  // Clean up
  fssync.rmSync(tmpDir, { recursive: true, force: true });

  await fs.writeFile(revFile, revision);
  console.log(`Downloaded ${files.length} ascii files`);
}

module.exports = {
  checkNeedUpdate,
  getDistantRev,
  updateDb,
  revFile,
};
