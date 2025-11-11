import { openDB } from 'idb';

const DB_NAME = 'StatsDB';
const STORE_NAME = 'stats';

export async function getStatsFromIDB(key: string) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  return db.get(STORE_NAME, key);
}

export async function setStatsToIDB(key: string, value: any, timestamp?: number) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  await db.put(STORE_NAME, { stats: value, timestamp: timestamp || Date.now() }, key);
}
