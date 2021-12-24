import { createRxDatabase, addRxPlugin } from 'rxdb/plugins/core';
import { addPouchPlugin, getRxStoragePouch } from 'rxdb/plugins/pouchdb';
import * as idb from 'pouchdb-adapter-idb';

import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBValidatePlugin } from 'rxdb/plugins/validate';
import eventSchema from './schema';
import { from } from 'rxjs';

/**
 * RxDB ========================================================================
 */

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBValidatePlugin);
addPouchPlugin(idb);

let dbPromise;

const _create = async () => {
  dbPromise = createRxDatabase({
    name: 'async-values',
    storage: getRxStoragePouch('idb'),
    ignoreDuplicate: true
  });
  const db = await dbPromise;
  await db.addCollections({ events: { schema: eventSchema } });
  return db;
};

export const dbInit = () => dbPromise ? dbPromise : _create();

export const dbStream = from(dbInit());


/**
 * Svelte Writables ============================================================
 */

