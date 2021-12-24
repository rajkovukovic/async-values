import { writable } from 'svelte/store';
import { createRxDatabase, addRxPlugin } from 'rxdb/plugins/core';
import { addPouchPlugin, getRxStoragePouch } from 'rxdb/plugins/pouchdb';
import * as idb from 'pouchdb-adapter-idb';

import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBValidatePlugin } from 'rxdb/plugins/validate';
import eventSchema from './schema';

/**
 * RxDB ========================================================================
 */

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBValidatePlugin);
addPouchPlugin(idb);

let dbPromise;

const _create = async () => {
  const db = await createRxDatabase({
    name: 'async-values',
    storage: getRxStoragePouch('idb'),
    ignoreDuplicate: true
  });
  await db.addCollections({ events: { schema: eventSchema } });
  dbPromise = Promise.resolve(db);
  return db;
};

export const dbInit = () => dbPromise ? dbPromise : _create();

/**
 * Svelte Writables ============================================================
 */

