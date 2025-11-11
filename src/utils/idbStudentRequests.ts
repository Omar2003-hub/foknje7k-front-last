import { openDB } from 'idb';
export async function clearStudentRequestsCache(key = 'studentRequests') {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  await db.delete(STORE_NAME, key);
}

const DB_NAME = 'StudentRequestsDB';
const STORE_NAME = 'studentRequests';

export async function getStudentRequestsFromIDB(key = 'studentRequests') {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  return db.get(STORE_NAME, key);
}

export async function setStudentRequestsToIDB(key = 'studentRequests', value: any[], timestamp?: number) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  await db.put(STORE_NAME, { requests: value, timestamp: timestamp || Date.now() }, key);
}
