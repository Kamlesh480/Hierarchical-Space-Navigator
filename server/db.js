import Database from 'better-sqlite3';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

let db;

export function getDb() {
  return db;
}

export function initDb() {
  db = new Database(join(__dirname, 'data.db'));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = OFF'); // off during bulk seed, re-enabled after

  db.exec(`
    CREATE TABLE IF NOT EXISTS sites (
      id   INTEGER PRIMARY KEY,
      name TEXT    NOT NULL
    );
    CREATE TABLE IF NOT EXISTS spaces (
      id              INTEGER PRIMARY KEY,
      name            TEXT    NOT NULL,
      site_id         INTEGER NOT NULL,
      parent_space_id INTEGER
    );
    CREATE TABLE IF NOT EXISTS streams (
      id       INTEGER PRIMARY KEY,
      name     TEXT    NOT NULL,
      space_id INTEGER NOT NULL
    );
  `);

  const count = db.prepare('SELECT COUNT(*) AS c FROM sites').get().c;
  if (count > 0) {
    db.pragma('foreign_keys = ON');
    return;
  }

  const seedData = require('./seedData.json');

  const insertSite   = db.prepare('INSERT INTO sites   (id, name)                         VALUES (?, ?)');
  const insertSpace  = db.prepare('INSERT INTO spaces  (id, name, site_id, parent_space_id) VALUES (?, ?, ?, ?)');
  const insertStream = db.prepare('INSERT INTO streams (id, name, space_id)                VALUES (?, ?, ?)');

  const seed = db.transaction(() => {
    for (const site of seedData.availableSites) {
      insertSite.run(Number(site.id), site.name);
    }

    const siteKey = { 'San Jose': 1, Toronto: 2 };

    for (const [siteLabel, groups] of [
      ['San Jose', seedData.sanJoseSpaces],
      ['Toronto',  seedData.torontoSpaces],
    ]) {
      const siteId = siteKey[siteLabel];
      for (const group of groups) {
        for (const space of group.spaces) {
          insertSpace.run(space.id, space.name, siteId, space.parentSpaceId ?? null);
          for (const stream of space.streams) {
            insertStream.run(stream.id, stream.name, space.id);
          }
        }
      }
    }
  });

  seed();
  db.pragma('foreign_keys = ON');
  console.log('Database seeded.');
}
