const path = require('path');
const axios = require('axios');
const fs = require('fs').promises;
const fssync = require('fs');
const { execSync } = require('child_process');

const revFile = path.join(__dirname, '..', 'catalog-revision.txt');
const catalogFile = path.join(__dirname, '..', 'src', 'db', 'catalog.json');
const ASCII_DIR = path.join(__dirname, '..', 'src', 'db');

const REPO = 'thisisdefinitelyajoke/database-ascii';
const LOCAL_DB = path.join(__dirname, '..', '..', 'database-ascii');
const LOCAL_DB_DB = path.join(LOCAL_DB, 'db');
const API_REV = `https://api.github.com/repos/${REPO}/commits?path=db/catalog.json`;

function run(cmd) {
  return execSync(cmd, { cwd: __dirname, encoding: 'utf-8', stdio: 'pipe' }).trim();
}

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

function copyFilesFrom(srcDir) {
  fssync.mkdirSync(ASCII_DIR, { recursive: true });
  fssync.copyFileSync(path.join(srcDir, 'catalog.json'), catalogFile);
  const files = fssync.readdirSync(srcDir).filter((f) => f.endsWith('.ascii.json'));
  for (const file of files) {
    fssync.copyFileSync(path.join(srcDir, file), path.join(ASCII_DIR, file));
  }
  return files.length;
}

async function updateDb(revision) {
  // Try local clone first (fast for dev)
  if (fssync.existsSync(LOCAL_DB_DB)) {
    console.log('Copying from local database-ascii repo...');
    const count = copyFilesFrom(LOCAL_DB_DB);
    await fs.writeFile(revFile, revision);
    console.log(`Copied ${count} ascii files`);
    return;
  }

  // Fall back to GitHub clone
  const tmpDir = path.join(__dirname, '..', '.tmp-ascii');
  fssync.mkdirSync(tmpDir, { recursive: true });

  console.log('Cloning repository from GitHub...');
  run(`git clone --depth 1 https://github.com/${REPO}.git ${tmpDir}`);

  const count = copyFilesFrom(path.join(tmpDir, 'db'));
  fssync.rmSync(tmpDir, { recursive: true, force: true });

  await fs.writeFile(revFile, revision);
  console.log(`Downloaded ${count} ascii files`);
}

module.exports = {
  checkNeedUpdate,
  getDistantRev,
  updateDb,
  revFile,
};
