import { openDB } from 'idb';

const DB_NAME = 'UsersDB';
const STORE_NAME = 'users';

export async function getUsersFromIDB(key = 'users') {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  return db.get(STORE_NAME, key);
}

export async function setUsersToIDB(key = 'users', value: any[]) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  await db.put(STORE_NAME, value, key);
}
